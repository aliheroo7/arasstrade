import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ورود | ارس‌ترید" },
      { name: "description", content: "ورود و ثبت‌نام در پلتفرم ارس‌ترید برای واردات و ترخیص از منطقه آزاد ارس." },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  full_name: z.string().trim().min(3, "نام کامل را وارد کنید").max(80),
  phone: z.string().trim().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)"),
  email: z.string().trim().email("ایمیل معتبر نیست").max(255),
  password: z.string().min(8, "رمز عبور حداقل ۸ کاراکتر باشد").max(72),
  terms_accepted: z.literal(true, { errorMap: () => ({ message: "پذیرش قوانین الزامی است" }) }),
});

const loginSchema = z.object({
  email: z.string().trim().email("ایمیل معتبر نیست"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard", replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div dir="rtl" className="font-sans min-h-screen bg-background text-foreground">
      <Toaster position="top-center" richColors />
      <div className="absolute top-0 right-0 size-72 rounded-full bg-brand-blue/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 size-72 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-md mx-auto px-6 pt-8 pb-16">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="size-4" />
          بازگشت به خانه
        </Link>

        <div className="font-extrabold text-2xl tracking-tight mb-2">
          ARAS<span className="text-brand-blue">TRADE</span>
        </div>
        <h1 className="text-2xl font-extrabold mb-2">
          {mode === "login" ? "ورود به حساب کاربری" : "ساخت حساب کاربری"}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {mode === "login"
            ? "به محیط حرفه‌ای ارس‌ترید خوش آمدید."
            : "برای ثبت سفارش و پیگیری ترخیص، حساب خود را بسازید."}
        </p>

        <div className="grid grid-cols-2 bg-surface rounded-2xl p-1 mb-6 border border-border">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`h-10 rounded-xl text-sm font-bold transition ${mode === "login" ? "bg-background shadow" : "text-muted-foreground"}`}
          >
            ورود
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`h-10 rounded-xl text-sm font-bold transition ${mode === "signup" ? "bg-background shadow" : "text-muted-foreground"}`}
          >
            ثبت‌نام
          </button>
        </div>

        {mode === "login" ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-foreground mb-1.5 block">{label}</span>
      {children}
      {error && <span className="text-[11px] text-destructive mt-1 block">{error}</span>}
    </label>
  );
}

const inputCls =
  "w-full h-12 px-4 rounded-2xl bg-surface border border-border focus:border-brand-blue focus:outline-none text-sm transition";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (map[i.path[0] as string] = i.message));
      setErrs(map);
      return;
    }
    setErrs({});
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("Invalid") ? "ایمیل یا رمز عبور اشتباه است" : error.message);
      return;
    }
    toast.success("خوش آمدید");
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="ایمیل" error={errs.email}>
        <input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
      </Field>
      <Field label="رمز عبور" error={errs.password}>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
      </Field>
      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 bg-premium-black text-primary-foreground rounded-2xl font-bold text-base shadow-xl shadow-premium-black/10 active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        ورود به حساب
      </button>
    </form>
  );
}

function SignupForm() {
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", password: "" });
  const [terms, setTerms] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ ...form, terms_accepted: terms });
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (map[i.path[0] as string] = i.message));
      setErrs(map);
      return;
    }
    setErrs({});
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: parsed.data.full_name,
          phone: parsed.data.phone,
          terms_accepted: true,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("registered") ? "این ایمیل قبلا ثبت شده است" : error.message);
      return;
    }
    toast.success("حساب شما ساخته شد. لطفا ایمیل خود را برای تایید بررسی کنید.");
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="نام و نام خانوادگی" error={errs.full_name}>
        <input value={form.full_name} onChange={upd("full_name")} className={inputCls} placeholder="مثال: علی محمدی" />
      </Field>
      <Field label="شماره موبایل" error={errs.phone}>
        <input dir="ltr" inputMode="numeric" maxLength={11} value={form.phone} onChange={upd("phone")} className={inputCls} placeholder="09123456789" />
      </Field>
      <Field label="ایمیل" error={errs.email}>
        <input type="email" dir="ltr" value={form.email} onChange={upd("email")} className={inputCls} placeholder="you@example.com" />
      </Field>
      <Field label="رمز عبور (حداقل ۸ کاراکتر)" error={errs.password}>
        <input type="password" value={form.password} onChange={upd("password")} className={inputCls} />
      </Field>

      <div className="bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 text-brand-blue font-bold text-sm mb-2">
          <ShieldCheck className="size-4" />
          قوانین ترخیص منطقه آزاد ارس
        </div>
        <ul className="text-[11px] leading-6 text-muted-foreground list-disc pr-5 space-y-0.5 max-h-32 overflow-auto">
          <li>کاربر متعهد می‌شود اطلاعات هویتی و شماره تماس صحیح ارائه دهد.</li>
          <li>کلیه فرآیند ترخیص بر اساس مقررات سازمان منطقه آزاد ارس و گمرک ج.ا.ا انجام می‌شود.</li>
          <li>پرداخت حقوق گمرکی، عوارض و مالیات بر عهده سفارش‌دهنده است.</li>
          <li>پیش‌فاکتور پس از تایید کاربر قطعی و غیرقابل لغو خواهد بود.</li>
          <li>زمان‌بندی تحویل وابسته به نوسانات لجستیکی و گمرکی است.</li>
          <li>ارس‌ترید مسئولیتی در قبال اقلام ممنوعه یا خارج از فهرست مجاز ندارد.</li>
        </ul>
        <label className="flex items-start gap-2 mt-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-1 size-4 accent-brand-blue"
          />
          <span className="text-xs font-medium text-foreground">
            با تمامی قوانین فوق و شرایط ترخیص کالا در منطقه آزاد ارس <strong>موافقم</strong>.
          </span>
        </label>
        {errs.terms_accepted && <span className="text-[11px] text-destructive mt-1 block">{errs.terms_accepted}</span>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 bg-premium-black text-primary-foreground rounded-2xl font-bold text-base shadow-xl shadow-premium-black/10 active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        ساخت حساب کاربری
      </button>
    </form>
  );
}