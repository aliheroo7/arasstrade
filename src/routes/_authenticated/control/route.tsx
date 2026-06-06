import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAdminContext } from "@/lib/me.functions";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/control")({
  component: ControlLayout,
});

function ControlLayout() {
  const fetchCtx = useServerFn(getAdminContext);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-context"],
    queryFn: () => fetchCtx(),
    retry: false,
  });

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen grid place-items-center bg-background text-foreground font-sans">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data?.isAdmin) {
    throw redirect({ to: "/control/login" });
  }

  return (
    <div dir="rtl" className="font-sans min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-brand-blue" />
            <div>
              <div className="text-sm font-extrabold">پنل مدیریت ارس‌ترید</div>
              <div className="text-[11px] text-muted-foreground">
                {data.profile?.full_name ?? "مدیر"} ·{" "}
                {data.isOwner
                  ? "مالک سیستم"
                  : data.roles.map((r) => r.name).join("، ") || "بدون نقش"}
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/control/login";
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
            خروج
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
