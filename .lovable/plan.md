
# Phase 2 — Admin + Customer Portal Foundation (Final Plan)

Backend foundation only. No homepage or public UI changes. After this build you can sign in as Owner at `/control/login`, reach an empty admin shell, and a logged-in customer reaches an empty portal shell. Real screens land in Phase 3+.

Decisions locked from your answers:
- **Owner email:** `aclash26@gmail.com` (assigned via bootstrap migration; user must exist in auth — sign up first if not already).
- **Admin URL:** `/control/login` and `/control/*`.
- **Storage:** private = `private-documents`, `epl-documents`, `customer-documents`. Public = `vehicle-media`, `site-media`.
- **EPL lock:** verified EPL profiles are read-only for customers; if an admin chooses to unlock (or customer edits via admin re-open), `verification_status` resets to `pending`. Enforced by trigger.

---

## 1. Roles & Permissions

**Roles seeded** (in `roles` table, `is_system=true` prevents deletion):
`owner`, `super_admin`, `admin`, `sales`, `customs_operator`, `content_manager`, `viewer`.

**Permissions seeded:**
`manage_admins`, `manage_roles`, `manage_customers`, `manage_inquiries`, `manage_cases`, `manage_documents`, `manage_vehicles`, `manage_site_content`, `manage_faq`, `manage_activity_feed`, `manage_articles`, `manage_settings`, `view_audit_logs`.

**Default role→permission mapping:**
- `owner` — all (implicit; helper short-circuits true)
- `super_admin` — all except `manage_admins`/`manage_roles` writes on owner row (blocked by trigger)
- `admin` — all except `manage_admins`, `manage_roles`
- `sales` — `manage_inquiries`, `manage_customers` (read-biased)
- `customs_operator` — `manage_cases`, `manage_documents`
- `content_manager` — `manage_vehicles`, `manage_site_content`, `manage_faq`, `manage_activity_feed`, `manage_articles`
- `viewer` — none (read-only via RLS read policies)

**Owner protection (DB triggers + RLS, not app code):**
- Partial unique index: only one active `owner` assignment ever.
- Trigger on `admin_role_assignments`: only owner may INSERT/UPDATE/DELETE rows where target role is `owner` or `super_admin`.
- Trigger on owner's own assignment: no one but owner may modify it; owner cannot be deactivated via `is_active=false`.
- Trigger on `role_permissions`: only owner may grant/revoke `manage_admins` or `manage_roles`.

**SECURITY DEFINER helpers in `public`:**
- `is_owner(uid uuid)`
- `is_admin(uid uuid)` — has any active admin role assignment AND `profiles.is_active`
- `has_permission(uid uuid, perm text)` — owner short-circuits true
- `current_user_permissions()` — returns text[] for the calling user (used by `me.adminContext`)

All RLS policies call these helpers — no recursive lookups.

---

## 2. Tables (domain columns only; every table also has `id`, `created_at`, `updated_at`)

### Identity & RBAC
- **profiles** (extend existing): + `is_active bool default true`, `avatar_url`, `last_seen_at`.
- **roles**: `slug` unique, `name`, `description`, `is_system bool`.
- **permissions**: `slug` unique, `name`, `description`, `category`.
- **role_permissions**: `role_id`, `permission_id`, unique pair.
- **admin_role_assignments**: `user_id`, `role_id`, `assigned_by`, `assigned_at`, `is_active bool`. Unique `(user_id, role_id)`.

### Customer domain
- **customers**: `user_id` unique fk auth.users, `display_name`, `company_name`, `national_id`, `company_id`, `phone_verified bool`, `kyc_status` (`pending|verified|rejected`), `admin_notes`.
- **epl_profiles**: `customer_id`, `epl_number`, `owner_name`, `national_or_company_id`, `phone`, `usage_type` (`personal|commercial|fleet`), `notes`, `verification_status` (`pending|verified|rejected`), `verified_by`, `verified_at`, `locked bool` (true after verify).
- **inquiries**: `customer_id` nullable, `type`, `name`, `phone`, `email`, `subject`, `message`, `status` (`new|in_review|qualified|closed`), `assigned_to`, `source` (`web|whatsapp|phone`).
- **cases**: `customer_id`, `case_code` (sequence-generated `ARS-YYYY-NNNNNN`), `tracking_code` (random short token, unique), `type` (`vehicle_clearance|vehicle_import|commercial_import|commercial_clearance`), `title`, `summary`, `status` (`draft|opened|documents_pending|in_customs|cleared|delivered|closed|cancelled`), `priority`, `assigned_to`, `epl_profile_id`, `opened_at`, `closed_at`.
- **case_status_history**: `case_id`, `from_status`, `to_status`, `changed_by`, `note`. Insert-only (UPDATE/DELETE blocked by trigger).
- **case_messages**: `case_id`, `sender_id`, `sender_role` (`customer|admin|system`), `body`, `is_internal bool`, `read_at`.

### Documents
- **documents**: `owner_user_id` (always set, for RLS), `customer_id`, `case_id`, `epl_profile_id`, `bucket` (constrained to allowed names), `storage_path` unique, `file_name`, `mime_type`, `size_bytes`, `category` (`passport|id|invoice|bill_of_lading|customs_decl|epl|other`), `uploaded_by`, `visibility` (`customer|internal`), `verification_status`.

### Public content
- **vehicles**: `slug` unique, `title`, `brand`, `model`, `year`, `price_label`, `status` (`ready|shipping|preorder|sold|hidden`), `summary`, `specs jsonb`, `display_order`, `is_published`.
- **vehicle_images**: `vehicle_id`, `storage_path`, `alt`, `display_order`, `is_cover`.
- **site_settings**: `key` unique, `value jsonb`.
- **site_content**: `key` + `locale` unique, `value jsonb`, `updated_by`.
- **faqs**: `question`, `answer`, `category`, `display_order`, `is_published`.
- **activity_feed**: `title`, `body`, `icon`, `published_at`, `is_published`.
- **articles**: `slug` unique, `title`, `excerpt`, `body_md`, `cover_path`, `author_id`, `published_at`, `is_published`, `seo jsonb`.

### Observability
- **audit_logs**: `actor_id`, `actor_role`, `action`, `entity_type`, `entity_id`, `metadata jsonb`, `ip`, `user_agent`. Insert-only.

### Key FKs
`customers.user_id → auth.users.id` cascade; `cases.customer_id → customers.id`; `documents.owner_user_id → auth.users.id`; `case_messages.case_id`, `case_status_history.case_id → cases.id` cascade; `admin_role_assignments.user_id → auth.users.id`.

---

## 3. RLS Policy Map

Every public table: enable RLS + `GRANT SELECT,INSERT,UPDATE,DELETE ON ... TO authenticated; GRANT ALL ... TO service_role`. `anon` SELECT only on published public content (`vehicles`/`vehicle_images` where published, `faqs`/`activity_feed`/`articles` where published, whitelisted `site_content`/`site_settings`).

| Table | Customer | Admin | Owner |
|---|---|---|---|
| profiles | self read/update | read all if `manage_customers` | full |
| roles, permissions, role_permissions | — | read all admins; write `manage_roles` | full (only owner can edit `manage_admins`/`manage_roles` mappings) |
| admin_role_assignments | — | read; write `manage_admins` AND target role ∉ {owner, super_admin} | full |
| customers | self read; self update limited fields | `manage_customers` | full |
| epl_profiles | self read; self insert; self update only when `locked=false`; never set verification_status | `manage_customers` | full |
| inquiries | self read own | `manage_inquiries`; **anon INSERT only** (no anon SELECT) for the public form | full |
| cases | self read own | `manage_cases` | full |
| case_status_history | self read own (non-internal) | `manage_cases` read; INSERT via trigger | full |
| case_messages | self read+insert where `is_internal=false` | `manage_cases` full | full |
| documents | self read/insert where `owner_user_id=auth.uid()` AND `visibility='customer'` | `manage_documents` | full |
| vehicles, vehicle_images | anon SELECT where published | `manage_vehicles` | full |
| site_settings, site_content | anon SELECT (whitelist) | `manage_site_content` / `manage_settings` | full |
| faqs, activity_feed, articles | anon SELECT where published | matching permission | full |
| audit_logs | — | SELECT `view_audit_logs`; INSERT via service_role/triggers only | full |

---

## 4. Storage

**Private buckets** (signed URLs, RLS on `storage.objects`):
- `private-documents` — generic case/customer docs. Path: `customers/{user_id}/{case_id?}/{uuid}-{filename}`
- `customer-documents` — KYC/profile docs. Path: `customers/{user_id}/{uuid}-{filename}`
- `epl-documents` — EPL attachments. Path: `customers/{user_id}/epl/{epl_profile_id}/{uuid}-{filename}`

RLS for all three: owner = `auth.uid()::text = (storage.foldername(name))[2]`; admin = `has_permission(auth.uid(), 'manage_documents')`.

**Public buckets** (direct URL `<img>` works):
- `vehicle-media` — public read. Write requires `manage_vehicles`.
- `site-media` — public read. Write requires `manage_site_content`.

Created via `storage_create_bucket` tool (not SQL).

**Server fns added:**
- `documents.signedUploadUrl({ bucket, target_kind, case_id?, epl_profile_id?, file_name, mime_type })` → checks permission, returns presigned PUT URL + path, inserts row in `documents` on completion (client posts back via `documents.confirm`).
- `documents.signedDownloadUrl({ document_id })` → checks RLS-equivalent via server fn, returns 5-min signed URL.

---

## 5. Audit Logging

Triggers insert into `audit_logs` on: `cases` status change, `admin_role_assignments` insert/update/delete, `role_permissions` change, `documents` insert, `epl_profiles` verification change, `customers` kyc change. Server fns wrap signed-URL minting with explicit audit entry.

---

## 6. Auth & Routing

- Keep `/auth` for customers (existing).
- New `/control/login` — admin login (Supabase email/password). On success, calls `me.adminContext`; if not `is_active_admin`, signs out and shows error.
- New protected layout `src/routes/_authenticated/control/route.tsx` (`ssr: false`):
  - `beforeLoad` calls `me.adminContext` server fn → `{ isOwner, roles[], permissions[] }`. If empty, redirect to `/control/login`.
  - Renders empty shell with sidebar placeholder + outlet.
- `src/routes/_authenticated/control/index.tsx` — "Welcome, {name}. Role: {roles}" placeholder.
- Customer portal:
  - `src/routes/_authenticated/portal/route.tsx` — calls `me.customerContext`, ensures `customers` row exists (auto-create on first visit via server fn), renders empty shell.
  - `src/routes/_authenticated/portal/index.tsx` — placeholder.
- Existing `src/routes/dashboard.tsx` is left untouched for now (Phase 3 will migrate it into `/portal`).

**Server fns added (all use `requireSupabaseAuth`):**
- `me.adminContext`, `me.customerContext` (auto-provisions `customers` row).
- `admin.listAdmins`, `admin.invite` (creates auth user via admin client + assigns role), `admin.assignRole`, `admin.revokeRole`, `admin.setActive` — gated by `manage_admins` + owner-protection trigger backstop.
- `admin.listRoles`, `admin.setRolePermissions` — gated by `manage_roles`.
- `documents.signedUploadUrl`, `documents.signedDownloadUrl`, `documents.confirm`.

All server fn files are `*.functions.ts`; any `supabaseAdmin` usage is `await import(...)` inside `.handler()` (per import-graph rules). `attachSupabaseAuth` is already wired in `src/start.ts`.

---

## 7. Files Changed / Added

**Migrations (in order, separate files):**
1. `phase2_01_rbac.sql` — roles, permissions, role_permissions, admin_role_assignments, helper functions, seeds, owner-protection triggers, profiles extension.
2. `phase2_02_customers_epl.sql` — customers, epl_profiles (+ lock trigger), inquiries.
3. `phase2_03_cases.sql` — cases (+ case_code sequence/trigger + tracking_code), case_status_history (insert-only trigger), case_messages.
4. `phase2_04_documents_audit.sql` — documents, audit_logs, audit triggers.
5. `phase2_05_content.sql` — vehicles, vehicle_images, site_settings, site_content, faqs, activity_feed, articles (schema only; homepage still uses hard-coded arrays — content migration is Phase 3).
6. `phase2_06_storage_policies.sql` — `storage.objects` policies for the 3 private buckets (+ public bucket admin-write policies).
7. `phase2_07_bootstrap_owner.sql` — find user by `aclash26@gmail.com`, assign Owner role; raises notice if user not found yet (re-runnable).

**Storage buckets via tool:** `private-documents` (private), `customer-documents` (private), `epl-documents` (private), `vehicle-media` (public), `site-media` (public).

**New code:**
- `src/integrations/supabase/rbac.ts` — client cache of current user's permissions via TanStack Query.
- `src/lib/me.functions.ts`
- `src/lib/admin.functions.ts`
- `src/lib/documents.functions.ts`
- `src/routes/_authenticated/control/route.tsx`
- `src/routes/_authenticated/control/index.tsx`
- `src/routes/_authenticated/portal/route.tsx`
- `src/routes/_authenticated/portal/index.tsx`
- `src/routes/control.login.tsx`

**Untouched:** `src/routes/index.tsx`, hero, services, vehicles section, FAQ, footer, navbar, existing `/auth`, existing `/dashboard`.

---

## 8. In Scope for This Build

- All 7 migrations (schema, RLS, GRANTs, triggers, seed data, owner bootstrap).
- 5 storage buckets + storage RLS.
- DB helper functions + owner-protection triggers.
- `me.*`, `admin.*`, `documents.*` server fns.
- `/control/login` + empty admin shell with role-gated route guard.
- Customer portal empty shell with auto-provisioning customer row.

## 9. Postponed to Phase 3+

- All admin screens (admin list, role editor, permission matrix, customer list, case kanban, document review queue, EPL verification, audit log viewer, settings/content/FAQ/articles CMS).
- All customer screens (profile editor, EPL form + upload, document upload UI, case list/detail, messages thread).
- Migrating homepage hard-coded vehicles/faqs/activities to DB-backed content.
- Public tracking page `/track/:code`.
- Wiring the existing inquiry form on the homepage to the `inquiries` table.
- Phone OTP verification.
- Email/in-app notifications.
- Article reader/blog routes.
- Rate-limiting on public endpoints.

---

## Prerequisites to call out at build time

- The Owner email `aclash26@gmail.com` must have an existing auth user before Owner privileges activate. If not yet signed up, the migration runs cleanly and a re-run (or a tiny "claim owner" server fn on first sign-in) attaches Owner. I'll include the re-runnable bootstrap so this is safe either way.
