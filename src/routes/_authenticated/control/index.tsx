import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAdminContext } from "@/lib/me.functions";

export const Route = createFileRoute("/_authenticated/control/")({
  component: ControlHome,
});

function ControlHome() {
  const fetchCtx = useServerFn(getAdminContext);
  const { data } = useQuery({ queryKey: ["admin-context"], queryFn: () => fetchCtx() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold mb-2">خوش آمدید، {data?.profile?.full_name ?? "مدیر"}</h1>
        <p className="text-sm text-muted-foreground">
          این پنل مدیریت ارس‌ترید است. در فاز بعدی ماژول‌های مشتریان، پرونده‌ها، EPL، اسناد، خودروها و محتوای سایت در این محیط اضافه می‌شوند.
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Link
          to="/control/cases"
          className="bg-surface border border-border rounded-2xl p-5 hover:border-brand-blue transition"
        >
          <div className="text-sm font-extrabold mb-1">پرونده‌ها</div>
          <div className="text-xs text-muted-foreground">
            مدیریت پرونده‌های ترخیص و واردات، تغییر وضعیت و گفتگو با مشتری
          </div>
        </Link>
      </section>

      <section className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="font-bold mb-3 text-sm">دسترسی‌های فعلی شما</h2>
        {data?.isOwner ? (
          <div className="text-xs text-brand-blue font-bold">دسترسی کامل (مالک سیستم)</div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {data?.permissions.length ? (
              data.permissions.map((p) => (
                <span key={p} className="text-[11px] bg-background border border-border rounded-full px-2.5 py-1">
                  {p}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">هیچ دسترسی فعالی ندارید.</span>
            )}
          </div>
        )}
      </section>

      <section className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="font-bold mb-2 text-sm">نقش‌های شما</h2>
        <div className="flex flex-wrap gap-1.5">
          {data?.roles.length ? (
            data.roles.map((r) => (
              <span key={r.slug} className="text-[11px] bg-background border border-border rounded-full px-2.5 py-1">
                {r.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">{data?.isOwner ? "مالک سیستم" : "بدون نقش"}</span>
          )}
        </div>
      </section>
    </div>
  );
}
