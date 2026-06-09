import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CASE_STATUSES = [
  "draft",
  "opened",
  "documents_pending",
  "in_customs",
  "cleared",
  "delivered",
  "closed",
  "cancelled",
] as const;

const CASE_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
const CASE_TYPES = [
  "vehicle_clearance",
  "vehicle_import",
  "commercial_import",
  "commercial_clearance",
] as const;

export const listCases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        status: z.enum(CASE_STATUSES).optional(),
        search: z.string().trim().max(120).optional(),
      })
      .partial()
      .parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    let q = supabase
      .from("cases")
      .select(
        "id, case_code, tracking_code, type, title, status, priority, assigned_to, opened_at, created_at, updated_at, customer:customers(id, display_name, company_name)",
      )
      .order("updated_at", { ascending: false })
      .limit(200);

    if (data.status) q = q.eq("status", data.status);
    if (data.search) {
      const s = data.search.replace(/[,()]/g, " ");
      q = q.or(`case_code.ilike.%${s}%,title.ilike.%${s}%,tracking_code.ilike.%${s}%`);
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getCaseDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase } = context;

    const [caseRes, msgsRes, historyRes, docsRes] = await Promise.all([
      supabase
        .from("cases")
        .select(
          "*, customer:customers(id, display_name, company_name, national_id, company_id, kyc_status, user_id)",
        )
        .eq("id", data.id)
        .maybeSingle(),
      supabase
        .from("case_messages")
        .select("*")
        .eq("case_id", data.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("case_status_history")
        .select("*")
        .eq("case_id", data.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("documents")
        .select("id, file_name, category, visibility, verification_status, created_at, storage_path, bucket")
        .eq("case_id", data.id)
        .order("created_at", { ascending: false }),
    ]);

    if (caseRes.error) throw new Error(caseRes.error.message);
    if (!caseRes.data) throw new Error("Case not found");

    return {
      case: caseRes.data,
      messages: msgsRes.data ?? [],
      history: historyRes.data ?? [],
      documents: docsRes.data ?? [],
    };
  });

export const updateCaseStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(CASE_STATUSES),
        priority: z.enum(CASE_PRIORITIES).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const patch: Record<string, unknown> = { status: data.status };
    if (data.priority) patch.priority = data.priority;
    if (data.status === "opened") patch.opened_at = new Date().toISOString();
    if (data.status === "closed" || data.status === "cancelled")
      patch.closed_at = new Date().toISOString();

    const { error } = await context.supabase.from("cases").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const postCaseMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        case_id: z.string().uuid(),
        body: z.string().trim().min(1).max(4000),
        is_internal: z.boolean().default(false),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("case_messages").insert({
      case_id: data.case_id,
      sender_id: context.userId,
      sender_role: "admin",
      body: data.body,
      is_internal: data.is_internal,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        customer_id: z.string().uuid(),
        type: z.enum(CASE_TYPES),
        title: z.string().trim().min(2).max(200),
        summary: z.string().trim().max(2000).optional(),
        priority: z.enum(CASE_PRIORITIES).default("normal"),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("cases")
      .insert({
        customer_id: data.customer_id,
        type: data.type,
        title: data.title,
        summary: data.summary ?? null,
        priority: data.priority,
        status: "opened",
        opened_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const listCustomersForPicker = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ search: z.string().trim().max(120).optional() }).partial().parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    let q = context.supabase
      .from("customers")
      .select("id, display_name, company_name, kyc_status")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data.search) {
      const s = data.search.replace(/[,()]/g, " ");
      q = q.or(`display_name.ilike.%${s}%,company_name.ilike.%${s}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const STATUS_LABELS: Record<(typeof CASE_STATUSES)[number], string> = {
  draft: "پیش‌نویس",
  opened: "باز",
  documents_pending: "در انتظار اسناد",
  in_customs: "در گمرک",
  cleared: "ترخیص‌شده",
  delivered: "تحویل‌شده",
  closed: "بسته‌شده",
  cancelled: "لغو‌شده",
};

export const TYPE_LABELS: Record<(typeof CASE_TYPES)[number], string> = {
  vehicle_clearance: "ترخیص خودرو",
  vehicle_import: "واردات خودرو",
  commercial_import: "واردات بازرگانی",
  commercial_clearance: "ترخیص بازرگانی",
};

export const PRIORITY_LABELS: Record<(typeof CASE_PRIORITIES)[number], string> = {
  low: "کم",
  normal: "عادی",
  high: "بالا",
  urgent: "فوری",
};

export { CASE_STATUSES, CASE_PRIORITIES, CASE_TYPES };