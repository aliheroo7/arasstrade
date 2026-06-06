import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAdminContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [profileRes, permsRes, rolesRes, ownerRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, avatar_url, is_active").eq("id", userId).maybeSingle(),
      supabase.rpc("current_user_permissions"),
      supabase
        .from("admin_role_assignments")
        .select("role:roles(slug,name)")
        .eq("user_id", userId)
        .eq("is_active", true),
      supabase.rpc("is_owner", { _uid: userId }),
    ]);

    const permissions = (permsRes.data as string[] | null) ?? [];
    const roles = ((rolesRes.data as Array<{ role: { slug: string; name: string } | null }> | null) ?? [])
      .map((r) => r.role)
      .filter((r): r is { slug: string; name: string } => !!r);
    const isOwner = Boolean(ownerRes.data);
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
