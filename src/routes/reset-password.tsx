import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "تنظیم رمز عبور جدید | ارس‌ترید" },
      { name: "description", content: "تنظیم رمز عبور جدید برای حساب کاربری ارس‌ترید." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const schema = z
  .object({
    password: z.string().min(8, "رمز عبور حداقل ۸ کاراکتر باشد").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "رمز عبور و تکرار آن یکسان نیست" });

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Supabase parses the recovery token from the URL hash and emits a PASSWORD_RECOVERY event,
  // creating a short-lived session that authorizes a single updateUser({ password }) call.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "INITIAL_SESSION" && session)) {
        setReady(true);
      }
    });
    // Fallback: if no recovery hash present after a moment, mark invalid
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) setInvalid(true);
      else setReady(true);
    }, 800);
    return () => {
      subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (map[i.path[0] as string] = i.message));
      setErrs(map);
      return;
    }
    setErrs({});
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) {
      toast.error(error.message || "خطا در تنظیم رمز عبور");
      return;
    }
    toast.success("رمز عبور با موفقیت تغییر کرد");
    // Sign out the recovery session so user logs in with the new password
    await supabase.auth.signOut();
    setTimeout(() => navigate({ to: "/auth", replace: true }), 600);
  };

  return (
    <div dir="rtl" className="font-sans min-h-screen bg-background text-foreground">
      <Toaster position="top-center" richColors />
      <div className="relative max-w-md mx-auto px-6 pt-8 pb-16">
        <Link to="/auth" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="size-4" />
          بازگشت به ورود
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="size-5 text-brand-blue" />
          <h1 className="text-2xl font-extrabold">تنظیم رمز عبور جدید</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          رمز عبور جدید خود را وارد کنید. پس از ذخیره، با رمز جدید وارد شوید.
        </p>

        {invalid ? (
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="font-bold mb-2 text-destructive">لینک نامعتبر یا منقضی شده</div>
            <p className="text-sm text-muted-foreground mb-4">
              این لینک بازیابی معتبر نیست یا منقضی شده است. لطفاً دوباره درخواست بازیابی ارسال کنید.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center w-full h-12 bg-premium-black text-primary-foreground rounded-2xl font-bold text-sm"
            >
              ارسال لینک جدید
            </Link>
          </div>
        ) : !ready ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-bold mb-1.5 block">رمز عبور جدید</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl bg-surface border border-border focus:border-brand-blue focus:outline-none text-sm"
                autoComplete="new-password"
              />
              {errs.password && <span className="text-[11px] text-destructive mt-1 block">{errs.password}</span>}
            </label>
            <label className="block">
              <span className="text-xs font-bold mb-1.5 block">تکرار رمز عبور</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl bg-surface border border-border focus:border-brand-blue focus:outline-none text-sm"
                autoComplete="new-password"
              />
              {errs.confirm && <span className="text-[11px] text-destructive mt-1 block">{errs.confirm}</span>}
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-premium-black text-primary-foreground rounded-2xl font-bold text-base active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              ذخیره رمز عبور جدید
            </button>
          </form>
        )}
      </div>
    </div>
  );
}