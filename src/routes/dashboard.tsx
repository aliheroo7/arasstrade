import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  LogOut, User, Phone, Mail, Plus, Loader2, Package, ShieldCheck, ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "پنل کاربری | ارس‌ترید" },
      { name: "description", content: "پنل اختصاصی کاربران ارس‌ترید برای پیگیری سفارش‌ها و ترخیص." },
    ],
  }),
  component: Dashboard,
});

type Profile = { id: string; full_name: string; phone: string; terms_accepted: boolean };
type Order = {
  id: string;
  car_model: string;
  car_year: string | null;
  origin: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

const statusLabel: Record<string, { fa: string; cls: string }> = {
  pending: { fa: "در انتظار بررسی", cls: "bg-brand-gold/10 text-brand-gold" },
  sourcing: { fa: "در حال تامین", cls: "bg-brand-blue/10 text-brand-blue" },
  clearance: { fa: "مرحله ترخیص", cls: "bg-brand-blue/10 text-brand-blue" },
  delivered: { fa: "تحویل شده", cls: "bg-emerald-500/10 text-emerald-600" },
  cancelled: { fa: "لغو شده", cls: "bg-destructive/10 text-destructive" },
};

function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/auth", replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    setEmail(userData.user.email ?? "");
    const [{ data: p }, { data: o }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userData.user.id).maybeSingle(),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    setProfile(p as Profile | null);
    setOrders((o as Order[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("از حساب خود خارج شدید");
    navigate({ to: "/", replace: true });
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="font-sans min-h-screen bg-background text-foreground">
      <Toaster position="top-center" richColors />

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-lg tracking-tight">
          ARAS<span className="text-brand-blue">TRADE</span>
        </Link>
        <button onClick={logout} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive">
          <LogOut className="size-4" />
          خروج
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8 pb-24">
        <section>
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="size-3" />
            بازگشت به وب‌سایت
          </Link>
          <h1 className="text-3xl font-extrabold mb-1">سلام {profile?.full_name?.split(" ")[0] || "کاربر"} 👋</h1>
          <p className="text-sm text-muted-foreground">به پنل اختصاصی ارس‌ترید خوش آمدید.</p>
        </section>

        <section className="bg-surface rounded-3xl p-6 border border-border">
          <div className="flex items-center gap-2 text-brand-blue font-bold text-xs mb-4">
            <ShieldCheck className="size-4" />
            اطلاعات حساب
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <InfoRow icon={User} label="نام" value={profile?.full_name || "—"} />
            <InfoRow icon={Phone} label="موبایل" value={profile?.phone || "—"} dir="ltr" />
            <InfoRow icon={Mail} label="ایمیل" value={email} dir="ltr" />
            <InfoRow icon={ShieldCheck} label="پذیرش قوانین" value={profile?.terms_accepted ? "تایید شده" : "نشده"} />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold">سفارش‌های من</h2>
            <button
              onClick={() => setShowForm((s) => !s)}
              className="h-10 px-4 bg-premium-black text-primary-foreground rounded-full text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="size-4" />
              سفارش جدید
            </button>
          </div>

          {showForm && <NewOrderForm onCreated={() => { setShowForm(false); load(); }} />}

          {orders.length === 0 ? (
            <div className="bg-surface border border-dashed border-border rounded-3xl p-10 text-center">
              <Package className="size-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => {
                const st = statusLabel[o.status] ?? { fa: o.status, cls: "bg-muted text-foreground" };
                return (
                  <div key={o.id} className="bg-background border border-border rounded-3xl p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="font-bold">{o.car_model}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {o.car_year && `مدل ${o.car_year}`} {o.origin && `• ${o.origin}`}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.fa}</span>
                    </div>
                    {o.notes && <p className="text-xs text-muted-foreground mt-2 leading-6">{o.notes}</p>}
                    <div className="text-[10px] text-muted-foreground mt-3">
                      ثبت در {new Date(o.created_at).toLocaleDateString("fa-IR")}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, dir }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; dir?: "ltr" | "rtl" }) {
  return (
    <div className="bg-background border border-border rounded-2xl p-3 flex items-center gap-3">
      <div className="size-9 rounded-xl bg-brand-blue/10 text-brand-blue grid place-items-center">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground">{label}</div>
        <div className="font-bold text-sm truncate" dir={dir}>{value}</div>
      </div>
    </div>
  );
}

function NewOrderForm({ onCreated }: { onCreated: () => void }) {
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [origin, setOrigin] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (model.trim().length < 2) {
      toast.error("نام خودرو را وارد کنید");
      return;
    }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("orders").insert({
      user_id: u.user.id,
      car_model: model.trim().slice(0, 120),
      car_year: year.trim().slice(0, 10) || null,
      origin: origin.trim().slice(0, 80) || null,
      notes: notes.trim().slice(0, 500) || null,
    });
    setBusy(false);
    if (error) {
      toast.error("ثبت سفارش با خطا مواجه شد");
      return;
    }
    toast.success("سفارش شما ثبت شد");
    setModel(""); setYear(""); setOrigin(""); setNotes("");
    onCreated();
  };

  const cls = "w-full h-11 px-4 rounded-2xl bg-background border border-border focus:border-brand-blue focus:outline-none text-sm";

  return (
    <form onSubmit={submit} className="bg-surface border border-border rounded-3xl p-5 mb-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="مدل خودرو یا کالا" className={cls} />
        <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="سال ساخت (مثلا ۲۰۲۰)" className={cls} />
        <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="کشور مبدا (اختیاری)" className={cls + " sm:col-span-2"} />
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="توضیحات تکمیلی..."
        rows={3}
        className="w-full p-4 rounded-2xl bg-background border border-border focus:border-brand-blue focus:outline-none text-sm resize-none"
      />
      <button
        type="submit"
        disabled={busy}
        className="w-full h-12 bg-premium-black text-primary-foreground rounded-2xl font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        ثبت سفارش
      </button>
    </form>
  );
}