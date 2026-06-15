import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "بازیابی رمز عبور | ارس‌ترید" },
      { name: "description", content: "بازیابی امن رمز عبور حساب کاربری ارس‌ترید از طریق ایمیل." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

const schema = z.object({
  email: z.string().trim().email("ایمیل معتبر نیست").max(255),
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message);
      return;
    }
    setErr(undefined);
    setLoading(true);
    // Supabase issues a single-use, time-limited recovery token and emails it.
    // We intentionally do NOT reveal whether the email exists (prevents user enumeration / timing leaks).
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    setSent(true);
    toast.success("اگر این ایمیل ثبت شده باشد، لینک بازیابی ارسال شد.");
  };

  return (
    <div dir="rtl" className="font-sans min-h-screen bg-background text-foreground">
      <Toaster position="top-center" richColors />
      <div className="relative max-w-md mx-auto px-6 pt-8 pb-16">
        <Link to="/auth" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="size-4" />
          بازگشت به ورود
        </Link>

        <h1 className="text-2xl font-extrabold mb-2">بازیابی رمز عبور</h1>
        <p className="text-sm text-muted-foreground mb-8">
          ایمیل حساب خود را وارد کنید. لینک امن بازیابی برای شما ارسال خواهد شد. این لینک
          فقط یکبار قابل استفاده است و پس از مدت کوتاهی منقضی می‌شود.
        </p>

        {sent ? (
          <div className="bg-surface border border-border rounded-2xl p-6 text-center">
            <MailCheck className="size-10 mx-auto text-brand-blue mb-3" />
            <div className="font-bold mb-2">درخواست شما ثبت شد</div>
            <p className="text-sm text-muted-foreground">
              اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی به آن ارسال شد. لطفاً پوشه
              Inbox و Spam را بررسی کنید.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-bold mb-1.5 block">ایمیل</span>
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl bg-surface border border-border focus:border-brand-blue focus:outline-none text-sm"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {err && <span className="text-[11px] text-destructive mt-1 block">{err}</span>}
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-premium-black text-primary-foreground rounded-2xl font-bold text-base active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              ارسال لینک بازیابی
            </button>
          </form>
        )}
      </div>
    </div>
  );
}