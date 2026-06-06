import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getAdminContext } from "@/lib/me.functions";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/control/login")({
  head: () => ({
    meta: [
      { title: "ورود مدیران | ارس‌ترید" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ControlLoginPage,
});

function ControlLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const fetchCtx = useServerFn(getAdminContext);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      try {
        const ctx = await fetchCtx();
        if (ctx.isAdmin) navigate({ to: "/control", replace: true });
      } catch {
        /* ignore */
      }
    })();
  }, [navigate, fetchCtx]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("ایمیل و رمز عبور را وارد کنید");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast.error(error.message.includes("Invalid") ? "ایمیل یا رمز عبور اشتباه است" : error.message);
      return;
    }
    try {
      const ctx = await fetchCtx();
      if (!ctx.isAdmin) {
        await supabase.auth.signOut();
        setLoading(false);
        toast.error("این حساب دسترسی مدیریتی ندارد.");
        return;
      }
      navigate({ to: "/control", replace: true });
    } catch {
      await supabase.auth.signOut();
      setLoading(false);
      toast.error("امکان بررسی دسترسی وجود ندارد.");
    }
  };

  return (
    <div dir="rtl" className="font-sans min-h-screen bg-background text-foreground">
      <Toaster position="top-center" richColors />
      <div className="absolute top-0 right-0 size-72 rounded-full bg-brand-blue/10 blur-3xl pointer-events-none" />
      <div className="relative max-w-md mx-auto px-6 pt-8 pb-16">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="size-4" />
          بازگشت به سایت
        </Link>

        <div className="inline-flex items-center gap-2 text-brand-blue font-bold text-sm mb-4">
          <ShieldCheck className="size-5" />
          ورود مدیران
        </div>
        <h1 className="text-2xl font-extrabold mb-2">پنل مدیریت ارس‌ترید</h1>
        <p className="text-sm text-muted-foreground mb-8">
          این بخش فقط برای مدیران و کارشناسان مجاز است.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold mb-1.5 block">ایمیل</span>
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-surface border border-border focus:border-brand-blue focus:outline-none text-sm transition"
              placeholder="admin@example.com"
              autoComplete="username"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold mb-1.5 block">رمز عبور</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-surface border border-border focus:border-brand-blue focus:outline-none text-sm transition"
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-premium-black text-primary-foreground rounded-2xl font-bold text-base shadow-xl shadow-premium-black/10 active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            ورود به پنل
          </button>
        </form>
      </div>
    </div>
  );
}
