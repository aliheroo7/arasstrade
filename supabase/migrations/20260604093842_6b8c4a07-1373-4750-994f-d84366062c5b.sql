
-- ============================================================
-- Phase 2.1 — RBAC foundation
-- ============================================================

-- 1. Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Shared updated_at trigger fn
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ============================================================
-- 2. roles
-- ============================================================
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- 3. permissions
-- ============================================================
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_permissions_updated_at BEFORE UPDATE ON public.permissions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- 4. role_permissions
-- ============================================================
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_id, permission_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_role_permissions_updated_at BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- 5. admin_role_assignments
-- ============================================================
CREATE TABLE public.admin_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_role_assignments TO authenticated;
GRANT ALL ON public.admin_role_assignments TO service_role;
ALTER TABLE public.admin_role_assignments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_ara_updated_at BEFORE UPDATE ON public.admin_role_assignments
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE INDEX idx_ara_user_active ON public.admin_role_assignments(user_id) WHERE is_active;
CREATE INDEX idx_ara_role ON public.admin_role_assignments(role_id);
-- Singleton owner enforced by trigger below (Postgres disallows subquery in partial index predicate).

-- ============================================================
-- 6. Helper functions (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_owner(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_role_assignments a
    JOIN public.roles r ON r.id = a.role_id
    WHERE a.user_id = _uid AND a.is_active AND r.slug = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_role_assignments a
    WHERE a.user_id = _uid AND a.is_active
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_admin(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_role_assignments a
    JOIN public.profiles p ON p.id = a.user_id
    WHERE a.user_id = _uid AND a.is_active AND p.is_active
  );
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_uid uuid, _perm text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_owner(_uid) OR EXISTS (
    SELECT 1
    FROM public.admin_role_assignments a
    JOIN public.role_permissions rp ON rp.role_id = a.role_id
    JOIN public.permissions p ON p.id = rp.permission_id
    JOIN public.profiles pr ON pr.id = a.user_id
    WHERE a.user_id = _uid AND a.is_active AND pr.is_active AND p.slug = _perm
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_permissions()
RETURNS text[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN public.is_owner(auth.uid()) THEN ARRAY(SELECT slug FROM public.permissions)
    ELSE COALESCE(ARRAY(
      SELECT DISTINCT p.slug
      FROM public.admin_role_assignments a
      JOIN public.role_permissions rp ON rp.role_id = a.role_id
      JOIN public.permissions p ON p.id = rp.permission_id
      JOIN public.profiles pr ON pr.id = a.user_id
      WHERE a.user_id = auth.uid() AND a.is_active AND pr.is_active
    ), ARRAY[]::text[])
  END;
$$;

-- ============================================================
-- 7. Seed roles, permissions, mappings
-- ============================================================
INSERT INTO public.roles (slug, name, description, is_system) VALUES
  ('owner',           'Owner',           'Highest level. Full and exclusive control.', true),
  ('super_admin',     'Super Admin',     'Broad admin powers below Owner.',            true),
  ('admin',           'Admin',           'Standard administrative access.',            true),
  ('sales',           'Sales',           'Inquiries and customer relationship.',       true),
  ('customs_operator','Customs Operator','Cases, documents, status updates.',          true),
  ('content_manager', 'Content Manager', 'Website content, vehicles, FAQs, articles.', true),
  ('viewer',          'Viewer',          'Read-only operational access.',              true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.permissions (slug, name, category) VALUES
  ('manage_admins',         'Manage admins',          'admin'),
  ('manage_roles',          'Manage roles',           'admin'),
  ('manage_customers',      'Manage customers',       'customer'),
  ('manage_inquiries',      'Manage inquiries',       'customer'),
  ('manage_cases',          'Manage customs/import cases', 'operations'),
  ('manage_documents',      'Manage documents',       'operations'),
  ('manage_vehicles',       'Manage vehicles',        'content'),
  ('manage_site_content',   'Manage site content',    'content'),
  ('manage_faq',            'Manage FAQ',             'content'),
  ('manage_activity_feed',  'Manage activity feed',   'content'),
  ('manage_articles',       'Manage articles',        'content'),
  ('manage_settings',       'Manage settings',        'admin'),
  ('view_audit_logs',       'View audit logs',        'admin')
ON CONFLICT (slug) DO NOTHING;

-- Default mappings (owner is implicit via has_permission short-circuit)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.slug = 'super_admin'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.slug = 'admin' AND p.slug NOT IN ('manage_admins','manage_roles')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.slug = 'sales' AND p.slug IN ('manage_inquiries','manage_customers')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.slug = 'customs_operator' AND p.slug IN ('manage_cases','manage_documents','manage_customers')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.slug = 'content_manager' AND p.slug IN
  ('manage_vehicles','manage_site_content','manage_faq','manage_activity_feed','manage_articles')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. Protection triggers
-- ============================================================

CREATE OR REPLACE FUNCTION public.tg_protect_admin_assignments()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  target_role_slug text;
  actor uuid := auth.uid();
  is_priv boolean;
BEGIN
  SELECT slug INTO target_role_slug FROM public.roles
  WHERE id = COALESCE(NEW.role_id, OLD.role_id);

  is_priv := target_role_slug IN ('owner','super_admin');

  -- Enforce singleton owner regardless of actor
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE')
     AND target_role_slug = 'owner'
     AND NEW.is_active THEN
    IF EXISTS (
      SELECT 1 FROM public.admin_role_assignments a
      JOIN public.roles r ON r.id = a.role_id
      WHERE r.slug = 'owner' AND a.is_active
        AND a.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Only one active Owner is allowed';
    END IF;
  END IF;

  -- Service role bypass for remaining checks
  IF actor IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  -- Owner can do anything
  IF public.is_owner(actor) THEN RETURN COALESCE(NEW, OLD); END IF;

  -- Non-owners cannot touch owner/super_admin rows
  IF is_priv THEN
    RAISE EXCEPTION 'Only the Owner may manage Owner or Super Admin assignments';
  END IF;

  -- Non-owners require manage_admins
  IF NOT public.has_permission(actor, 'manage_admins') THEN
    RAISE EXCEPTION 'manage_admins permission required';
  END IF;

  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER trg_protect_admin_assignments
BEFORE INSERT OR UPDATE OR DELETE ON public.admin_role_assignments
FOR EACH ROW EXECUTE FUNCTION public.tg_protect_admin_assignments();

CREATE OR REPLACE FUNCTION public.tg_protect_role_permissions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  perm_slug text;
  actor uuid := auth.uid();
BEGIN
  SELECT slug INTO perm_slug FROM public.permissions
  WHERE id = COALESCE(NEW.permission_id, OLD.permission_id);

  IF actor IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  IF public.is_owner(actor) THEN RETURN COALESCE(NEW, OLD); END IF;

  IF perm_slug IN ('manage_admins','manage_roles') THEN
    RAISE EXCEPTION 'Only the Owner may grant or revoke manage_admins / manage_roles';
  END IF;

  IF NOT public.has_permission(actor, 'manage_roles') THEN
    RAISE EXCEPTION 'manage_roles permission required';
  END IF;

  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER trg_protect_role_permissions
BEFORE INSERT OR UPDATE OR DELETE ON public.role_permissions
FOR EACH ROW EXECUTE FUNCTION public.tg_protect_role_permissions();

CREATE OR REPLACE FUNCTION public.tg_protect_system_roles()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.is_system THEN
    RAISE EXCEPTION 'System roles cannot be deleted';
  END IF;
  RETURN OLD;
END $$;

CREATE TRIGGER trg_protect_system_roles
BEFORE DELETE ON public.roles
FOR EACH ROW EXECUTE FUNCTION public.tg_protect_system_roles();

-- ============================================================
-- 9. RLS Policies
-- ============================================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_customers') OR public.is_owner(auth.uid()));

CREATE POLICY "Active admins can view roles" ON public.roles
  FOR SELECT TO authenticated USING (public.is_active_admin(auth.uid()));
CREATE POLICY "Owner can manage roles" ON public.roles
  FOR ALL TO authenticated
  USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

CREATE POLICY "Active admins can view permissions" ON public.permissions
  FOR SELECT TO authenticated USING (public.is_active_admin(auth.uid()));
CREATE POLICY "Owner can manage permissions" ON public.permissions
  FOR ALL TO authenticated
  USING (public.is_owner(auth.uid())) WITH CHECK (public.is_owner(auth.uid()));

CREATE POLICY "Active admins can view role_permissions" ON public.role_permissions
  FOR SELECT TO authenticated USING (public.is_active_admin(auth.uid()));
CREATE POLICY "manage_roles can write role_permissions" ON public.role_permissions
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_roles'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_roles'));

CREATE POLICY "Active admins can view assignments" ON public.admin_role_assignments
  FOR SELECT TO authenticated USING (public.is_active_admin(auth.uid()));
CREATE POLICY "manage_admins can write assignments" ON public.admin_role_assignments
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_admins'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_admins'));
