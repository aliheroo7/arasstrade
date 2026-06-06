import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/portal/")({
  component: PortalHome,
});

function PortalHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold mb-2">به پورتال مشتری خوش آمدید</h1>
        <p className="text-sm text-muted-foreground leading-7">
          در فاز بعدی این بخش‌ها فعال می‌شوند: تکمیل پروفایل، ثبت و تایید پلاک منطقه آزاد (EPL)،
          بارگذاری اسناد، ثبت سفارش ترخیص، پیگیری مرحله‌ای پرونده‌ها و گفت‌وگو با کارشناس.
        </p>
      </div>

      <section className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="font-bold mb-2 text-sm">وضعیت حساب</h2>
        <p className="text-xs text-muted-foreground">
          حساب مشتری شما با موفقیت ایجاد شد. به‌زودی می‌توانید پرونده‌های ترخیص خود را از این محیط مدیریت کنید.
        </p>
      </section>
    </div>
  );
}
