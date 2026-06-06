import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getCustomerContext } from "@/lib/me.functions";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, UserCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal")({
  component: PortalLayout,
});

function PortalLayout() {
  const fetchCtx = useServerFn(getCustomerContext);
  const { data, isLoading } = useQuery({
    queryKey: ["customer-context"],
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

  return (
    <div dir="rtl" className="font-sans min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCircle2 className="size-5 text-brand-blue" />
            <div>
              <div className="text-sm font-extrabold">پورتال مشتری ارس‌ترید</div>
              <div className="text-[11px] text-muted-foreground">
                {data?.profile?.full_name ?? "کاربر"}
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/auth";
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
            خروج
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
