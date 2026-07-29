import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAdminContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [profileRes, rolesRes, ownerRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, avatar_url, is_active").eq("id", userId).maybeSingle(),
      supabase
        .from("admin_role_assignments")
        .select("role:roles(slug,name)")
        .eq("user_id", userId)
        .eq("is_active", true),
      supabase.rpc("is_owner", { _uid: userId }),
    ]);

    const isOwnerFlag = Boolean(ownerRes.data);
    let permissions: string[] = [];
    if (isOwnerFlag) {
      const { data } = await supabaseAdmin.from("permissions").select("slug");
      permissions = (data ?? []).map((p) => p.slug);
    } else {
      const { data } = await supabaseAdmin
        .from("admin_role_assignments")
        .select("is_active, role_permissions:roles(role_permissions(permissions(slug)))")
        .eq("user_id", userId)
        .eq("is_active", true);
      const slugs = new Set<string>();
      for (const row of (data ?? []) as any[]) {
        for (const rp of row?.role_permissions?.role_permissions ?? []) {
          if (rp?.permissions?.slug) slugs.add(rp.permissions.slug);
        }
      }
      permissions = [...slugs];
    }
    const roles = ((rolesRes.data as Array<{ role: { slug: string; name: string } | null }> | null) ?? [])
      .map((r) => r.role)
      .filter((r): r is { slug: string; name: string } => !!r);
    const isOwner = isOwnerFlag;
    const isAdmin = isOwner || roles.length > 0;

    return {
      userId,
      profile: profileRes.data,
      roles,
      permissions,
      isOwner,
      isAdmin,
    };
  });

export const getCustomerContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, phone, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    let { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!customer) {
      const { data: created, error } = await supabase
        .from("customers")
        .insert({ user_id: userId, display_name: profile?.full_name ?? null })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      customer = created;
    }

    return { userId, profile, customer };
  });
