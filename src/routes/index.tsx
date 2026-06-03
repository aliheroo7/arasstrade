import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import landCruiser from "@/assets/car-landcruiser.jpg";
import lexus from "@/assets/car-lexus.jpg";
import rangeRover from "@/assets/car-rangerover.jpg";
import cayenne from "@/assets/car-cayenne.jpg";
import gclass from "@/assets/car-gclass.jpg";
import bmwx7 from "@/assets/car-bmwx7.jpg";
import heroImport from "@/assets/hero-import.jpg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Send,
  Instagram,
  MessageCircle,
  ShieldCheck,
  Truck,
  Package,
  FileCheck,
  Home,
  Search,
  Heart,
  User,
  Award,
  Globe2,
  Headphones,
  Eye,
  Car,
  FileSignature,
  ClipboardList,
  PhoneCall,
  Calculator,
  CheckCircle2,
  Activity,
  Anchor,
  Container,
  Sparkles,
  Gauge,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ارس‌ترید | واردات و ترخیص تخصصی خودرو از منطقه آزاد ارس" },
      {
        name: "description",
        content:
          "ارس‌ترید، متخصص واردات و ترخیص خودرو، واردات کالای تجاری و تأمین بین‌المللی از منطقه آزاد ارس. مشاوره رایگان، فرآیند شفاف و پشتیبانی تخصصی.",
      },
      { property: "og:title", content: "ارس‌ترید | واردات و ترخیص تخصصی خودرو" },
      {
        property: "og:description",
        content:
          "واردات و ترخیص خودرو و کالای تجاری از منطقه آزاد ارس با تیم تخصصی و فرآیند شفاف.",
      },
    ],
  }),
  component: Index,
});

// ---------- DATA (CMS-ready) ----------

const contact = {
  phone: "09142308507",
  phoneIntl: "+989142308507",
  whatsapp: "989142308507",
  email: "ArassTrade@gmail.com",
  instagram: "ArassTrade",
  telegram: "ArassTrade",
  address: "جلفا، دومین ورودی منطقه آزاد ارس، دومین کوچه سمت چپ، پلاک ۳",
  brand: "ارس‌ترید",
  legalName: "ارس تجارت ارس",
};

const finalCta = {
  headline: "مسیر واردات و ترخیص، شفاف و قابل پیگیری",
  subtitle:
    "برای بررسی شرایط واردات خودرو، ترخیص خودرو و کالای تجاری، با کارشناسان ارس‌ترید در ارتباط باشید.",
  features: [
    { icon: Eye, title: "شفافیت در فرآیند", desc: "گزارش مرحله‌ای از همه اقدامات" },
    { icon: Headphones, title: "مشاوره تخصصی", desc: "تیم گمرکی و حقوقی پاسخگو" },
    { icon: Activity, title: "پیگیری تا ترخیص نهایی", desc: "از ثبت درخواست تا تحویل" },
  ],
};

const requestTypes = [
  { value: "car-clearance", label: "ترخیص خودرو" },
  { value: "car-import", label: "واردات خودرو" },
  { value: "goods-import", label: "واردات کالا" },
  { value: "goods-clearance", label: "ترخیص کالا" },
  { value: "preorder", label: "پیش‌فروش خودرو" },
  { value: "ready", label: "خرید خودرو آماده" },
];

const trustItems = [
  { icon: Award, title: "بیش از ۱۸ سال تجربه عملی", desc: "در واردات و ترخیص خودرو و کالا" },
  { icon: Eye, title: "فرآیند شفاف", desc: "گزارش مرحله‌ای از تمام مراحل" },
  { icon: Globe2, title: "شبکه تأمین بین‌المللی", desc: "همکاران معتبر در امارات، آلمان، ژاپن" },
  { icon: Headphones, title: "پشتیبانی تخصصی", desc: "تیم حقوقی و گمرکی پاسخگو" },
];

const services = [
  {
    icon: ShieldCheck,
    title: "ترخیص خودرو",
    desc: "انجام تمام مراحل قانونی ترخیص خودرو از گمرک منطقه آزاد ارس با کوتاه‌ترین زمان.",
    bullets: ["مدارک کامل گمرکی", "پلاک‌گذاری", "بیمه و انتقال سند"],
  },
  {
    icon: Car,
    title: "واردات خودرو",
    desc: "تأمین مستقیم خودروهای لوکس و پرتقاضا از بازارهای جهانی بدون واسطه.",
    bullets: ["انتخاب از مبدأ", "حمل بیمه‌شده", "بازرسی فنی پیش از خرید"],
  },
  {
    icon: Container,
    title: "واردات و ترخیص کالا",
    desc: "واردات کالای تجاری، صنعتی و لوکس و ترخیص آن از گمرک ارس و سایر گمرکات کشور.",
    bullets: ["ثبت سفارش", "ترانزیت بین‌المللی", "ترخیص قطعی"],
  },
];

const vehicleGroups = {
  ready: [
    { name: "Mercedes-Benz C200", year: "۲۰۲۲", origin: "آلمان", img: rangeRover, badge: "آماده تحویل" },
    { name: "BMW X5", year: "۲۰۲۱", origin: "آلمان", img: bmwx7, badge: "آماده تحویل" },
    { name: "Lexus RX350", year: "۲۰۲۲", origin: "ژاپن", img: lexus, badge: "آماده تحویل" },
  ],
  shipping: [
    { name: "BMW 530i", year: "۲۰۲۳", origin: "آلمان", img: rangeRover, badge: "در حال واردات" },
    { name: "Mercedes-Benz E-Class", year: "۲۰۲۳", origin: "آلمان", img: gclass, badge: "در حال واردات" },
    { name: "Toyota Land Cruiser", year: "۲۰۲۳", origin: "امارات", img: landCruiser, badge: "در حال واردات" },
  ],
  preorder: [
    { name: "BMW X7", year: "۲۰۲۴", origin: "آلمان", img: bmwx7, badge: "پیش‌فروش" },
    { name: "Mercedes-Benz G-Class", year: "۲۰۲۴", origin: "آلمان", img: gclass, badge: "پیش‌فروش" },
    { name: "Porsche Cayenne", year: "۲۰۲۴", origin: "آلمان", img: cayenne, badge: "پیش‌فروش" },
    { name: "Lexus LX600", year: "۲۰۲۴", origin: "ژاپن", img: lexus, badge: "پیش‌فروش" },
  ],
};

const processSteps = [
  { n: "۰۱", title: "ثبت درخواست", desc: "تکمیل فرم یا تماس", icon: ClipboardList },
  { n: "۰۲", title: "مشاوره تخصصی", desc: "بررسی نیاز و گزینه‌ها", icon: PhoneCall },
  { n: "۰۳", title: "استعلام هزینه", desc: "پیشنهاد قیمت شفاف", icon: Calculator },
  { n: "۰۴", title: "عقد قرارداد", desc: "ثبت رسمی توافق", icon: FileSignature },
  { n: "۰۵", title: "واردات و ترخیص", desc: "اجرای کامل فرآیند", icon: Anchor },
  { n: "۰۶", title: "تحویل", desc: "تحویل ایمن و بیمه‌شده", icon: Truck },
];

const activities = [
  { icon: ClipboardList, tone: "blue", text: "بررسی پرونده ترخیص یک دستگاه SUV وارداتی", time: "اخیراً" },
  { icon: Anchor, tone: "green", text: "ثبت درخواست واردات خودرو از مسیر امارات", time: "اخیراً" },
  { icon: CheckCircle2, tone: "gold", text: "تکمیل فرآیند مشاوره ترخیص کالای تجاری", time: "اخیراً" },
  { icon: FileSignature, tone: "blue", text: "آماده‌سازی مدارک ترخیص خودرو در منطقه آزاد ارس", time: "اخیراً" },
  { icon: Truck, tone: "green", text: "پیگیری وضعیت واردات خودرو در مرحله حمل", time: "اخیراً" },
];

const toneClasses: Record<string, string> = {
  green: "bg-emerald-500/10 text-emerald-600",
  blue: "bg-brand-blue/10 text-brand-blue",
  gold: "bg-brand-gold/10 text-brand-gold",
};

const whyItems = [
  { icon: ShieldCheck, title: "مطابق با قوانین گمرک", desc: "اجرای فرآیندها در چارچوب مقررات" },
  { icon: Eye, title: "شفافیت قیمت", desc: "هیچ هزینه‌ی پنهانی وجود ندارد" },
  { icon: Globe2, title: "تأمین جهانی", desc: "شبکه‌ای از تأمین‌کنندگان معتبر" },
  { icon: Activity, title: "گزارش مرحله‌ای", desc: "از خرید تا تحویل در دسترس شماست" },
  { icon: Headphones, title: "مشاوره رایگان", desc: "تیم متخصص پاسخگوی شما" },
  { icon: Award, title: "۱۸ سال تجربه عملی", desc: "تکیه بر سابقه طولانی در حوزه ترخیص" },
];

const faqs = [
  {
    q: "ترخیص خودرو از منطقه آزاد ارس چقدر زمان می‌برد؟",
    a: "زمان ترخیص به نوع خودرو، کامل بودن مدارک و شرایط روز گمرک بستگی دارد. در فرآیند معمول، ترخیص ظرف چند روز کاری انجام می‌شود و در طول مسیر گزارش مرحله‌ای ارائه می‌گردد.",
  },
  {
    q: "اگر خودرو را خودمان از خارج تهیه کرده باشیم، ارس‌ترید ترخیص آن را انجام می‌دهد؟",
    a: "بله، در صورت تأمین خودرو توسط شما، تیم ارس‌ترید فرآیند ترخیص را از منطقه آزاد ارس به‌صورت تخصصی پیگیری می‌کند.",
  },
  {
    q: "امکان واردات خودرو از امارات یا چین وجود دارد؟",
    a: "بله، با توجه به شبکه تأمین بین‌المللی، واردات خودرو از مسیرهایی مانند امارات و چین قابل بررسی است و شرایط هر پرونده در مشاوره اولیه به‌صورت اختصاصی اعلام می‌شود.",
  },
  {
    q: "هزینه واردات و ترخیص خودرو چگونه محاسبه می‌شود؟",
    a: "هزینه‌ها بر اساس ارزش گمرکی، حقوق ورودی، مالیات، عوارض رسمی و هزینه‌های جانبی محاسبه و به‌صورت پیش‌فاکتور شفاف ارائه می‌شود.",
  },
  {
    q: "برای شروع فرآیند ترخیص چه مدارکی لازم است؟",
    a: "مدارک متناسب با نوع خودرو یا کالا متفاوت است. در مشاوره اولیه، فهرست دقیق مدارک شامل اسناد مالکیت، فاکتور خرید، اسناد حمل و مدارک هویتی به شما اعلام می‌شود.",
  },
  {
    q: "آیا واردات و ترخیص کالای تجاری هم انجام می‌دهید؟",
    a: "بله، علاوه بر خودرو، واردات و ترخیص انواع کالای تجاری و صنعتی نیز با همان فرآیند تخصصی و گزارش مرحله‌ای انجام می‌شود.",
  },
];

// ---------- COMPONENT ----------

function Index() {
  return (
    <div dir="rtl" className="font-sans bg-background text-foreground min-h-screen pb-28">
      <Toaster position="top-center" richColors />
      <Navbar />
      <Hero />
      <TrustStrip />
      <AboutExperience />
      <MainServices />
      <FeaturedVehicles />
      <WorkProcess />
      <RecentActivities />
      <WhyUs />
      <InquiryForm />
      <FAQ />
      <FinalCTA />
      <Footer />
      <BottomNav />
    </div>
  );
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-6 h-16 flex items-center justify-between">
      <a href="#" className="font-extrabold text-xl tracking-tight text-premium-black">
        ARAS<span className="text-brand-blue">TRADE</span>
      </a>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <a href="#services" className="hover:text-foreground transition">خدمات</a>
        <a href="#vehicles" className="hover:text-foreground transition">خودروها</a>
        <a href="#process" className="hover:text-foreground transition">فرآیند کار</a>
        <a href="#faq" className="hover:text-foreground transition">سؤالات متداول</a>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/auth" className="hidden md:inline-flex h-10 items-center px-4 rounded-full border border-border text-sm font-semibold">
          ورود / ثبت‌نام
        </Link>
        <Link to="/auth" aria-label="حساب کاربری" className="size-10 rounded-full bg-surface grid place-items-center border border-border md:hidden">
          <User className="size-4" />
        </Link>
        <a href="#inquiry" className="hidden md:inline-flex h-10 items-center px-5 rounded-full bg-premium-black text-primary-foreground text-sm font-semibold">درخواست مشاوره</a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute -top-24 -left-24 size-[420px] rounded-full bg-brand-blue/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-12 pb-16 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          {/* Text column — mobile first, desktop right */}
          <div className="lg:col-span-7 lg:order-2 order-1 text-center lg:text-right flex flex-col justify-center">
            <div
              className="opacity-0 animate-fade-in inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-medium mb-6 self-center lg:self-end"
              style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue" />
              </span>
              منطقه آزاد ارس • فعال
            </div>

            <div
              dir="ltr"
              className="opacity-0 animate-fade-in text-[11px] tracking-[0.25em] text-muted-foreground mb-4 font-medium lg:text-right text-center"
              style={{ animationDelay: "80ms", animationFillMode: "forwards" }}
            >
              ARAS TRADE — INTERNATIONAL TRADE &amp; CUSTOMS
            </div>

            <h1 className="font-bold tracking-tight text-premium-black text-[2rem] sm:text-[2.5rem] lg:text-[3.25rem] leading-[1.25] mb-6">
              <span
                className="block opacity-0 animate-fade-in"
                style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
              >
                واردات و ترخیص تخصصی
              </span>
              <span
                className="block mt-1 opacity-0 animate-fade-in"
                style={{ animationDelay: "240ms", animationFillMode: "forwards" }}
              >
                خودرو و کالای تجاری
              </span>
              <span
                className="block mt-2 text-brand-blue opacity-0 animate-fade-in"
                style={{ animationDelay: "360ms", animationFillMode: "forwards" }}
              >
                از منطقه آزاد ارس
              </span>
            </h1>

            <p
              className="opacity-0 animate-fade-in text-muted-foreground text-[15px] lg:text-[17px] leading-[2] mb-8 max-w-[34rem] mx-auto lg:mx-0 lg:ml-auto lg:mr-0"
              style={{ animationDelay: "480ms", animationFillMode: "forwards" }}
            >
              ارس‌ترید با تکیه بر تیم تخصصی گمرکی و شبکه تأمین بین‌المللی، تمام مراحل واردات و ترخیص خودرو و کالای تجاری شما را با اطمینان و شفافیت کامل به انجام می‌رساند.
            </p>

            <div
              className="opacity-0 animate-fade-in flex flex-col sm:flex-row gap-3 sm:items-center justify-center lg:justify-end"
              style={{ animationDelay: "600ms", animationFillMode: "forwards" }}
            >
              <a
                href="#inquiry"
                className="h-14 px-7 bg-premium-black text-primary-foreground rounded-2xl font-semibold text-base shadow-[0_14px_36px_-12px_oklch(0.18_0.005_270/0.55)] hover:-translate-y-0.5 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
              >
                درخواست مشاوره ترخیص خودرو
                <ArrowLeft className="size-4" />
              </a>
              <a
                href="#vehicles"
                className="h-14 px-7 bg-transparent border border-border text-foreground/80 hover:text-foreground hover:border-foreground/40 rounded-2xl font-medium active:scale-[0.98] transition-all inline-flex items-center justify-center"
              >
                مشاهده خودروها
              </a>
            </div>

            <div
              className="opacity-0 animate-fade-in mt-5 flex items-center gap-2 text-xs text-muted-foreground justify-center lg:justify-end"
              style={{ animationDelay: "720ms", animationFillMode: "forwards" }}
            >
              <ShieldCheck className="size-3.5 text-brand-blue" />
              مشاوره رایگان • بدون تعهد • پاسخگویی در کمتر از ۲۴ ساعت
            </div>
          </div>

          {/* Image column — desktop left, mobile last */}
          <div
            className="lg:col-span-5 lg:order-1 order-2 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
          >
            <div className="relative h-full rounded-[32px] overflow-hidden border border-border shadow-2xl shadow-premium-black/10">
              <img
                src={heroImport}
                alt="انبار و گمرک منطقه آزاد ارس — ترخیص و ترانزیت خودرو"
                width={1200}
                height={1500}
                className="w-full h-full object-cover aspect-[4/5] lg:aspect-auto lg:min-h-[560px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-premium-black/40 via-transparent to-transparent" />

              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-background/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold border border-border">
                <Anchor className="size-3 text-brand-blue" />
                ترخیص و ترانزیت • ارس
              </div>

              <div className="absolute bottom-4 right-4 left-4 bg-background/90 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between border border-border">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-brand-blue/10 text-brand-blue grid place-items-center">
                    <Container className="size-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-muted-foreground">تجربه عملی</div>
                    <div className="font-extrabold text-sm">بیش از ۱۸ سال در حوزه ترخیص</div>
                  </div>
                </div>
                <div className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full font-bold">فعال</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="px-6 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {trustItems.map((it) => (
          <div key={it.title} className="bg-surface p-5 rounded-3xl border border-border">
            <it.icon className="size-5 text-brand-blue mb-3" />
            <div className="font-bold text-sm mb-1">{it.title}</div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">{it.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutExperience() {
  return (
    <section className="px-6 py-10">
      <div className="relative overflow-hidden rounded-[32px] border border-border bg-surface p-8 md:p-12">
        <div className="absolute -top-16 -left-16 size-64 rounded-full bg-brand-blue/10 blur-3xl pointer-events-none" />
        <div className="relative grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-center">
          <div className="size-20 md:size-24 rounded-3xl bg-brand-blue/10 text-brand-blue grid place-items-center shrink-0">
            <Award className="size-10" />
          </div>
          <div>
            <div className="text-brand-blue text-xs font-bold mb-2">درباره ارس‌ترید</div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
              ۱۸ سال تجربه در واردات و ترخیص
            </h2>
            <p className="text-sm md:text-[15px] text-muted-foreground leading-[2]">
              ارس‌ترید با نام رسمی «{contact.legalName}»، با بیش از ۱۸ سال تجربه عملی در حوزه واردات،
              ترخیص خودرو و کالای تجاری در منطقه آزاد ارس، فرآیند واردات و ترخیص را با تمرکز بر
              شفافیت، پیگیری مرحله‌ای و مشاوره تخصصی مدیریت می‌کند.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MainServices() {
  return (
    <section id="services" className="px-6 py-12">
      <div className="mb-8">
        <div className="text-brand-blue text-xs font-bold mb-2">خدمات تخصصی</div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">خدمات اصلی ارس‌ترید</h2>
        <p className="text-sm text-muted-foreground max-w-md">سه حوزه‌ی تخصصی ما برای رساندن کالا و خودروی شما به مقصد.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {services.map((s) => (
          <article key={s.title} className="group bg-background border border-border rounded-[32px] p-7 hover:border-brand-blue hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="size-14 rounded-2xl bg-brand-blue/10 text-brand-blue grid place-items-center mb-5 group-hover:bg-brand-blue group-hover:text-white transition-colors">
              <s.icon className="size-6" />
            </div>
            <h3 className="font-extrabold text-lg mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{s.desc}</p>
            <ul className="space-y-2 mb-6">
              {s.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-xs text-foreground">
                  <CheckCircle2 className="size-3.5 text-brand-blue shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <a href="#inquiry" className="text-brand-blue text-sm font-bold flex items-center gap-1.5">
              اطلاعات بیشتر
              <ArrowLeft className="size-3.5" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function VehicleCard({ v }: { v: { name: string; year: string; origin: string; img: string; badge: string } }) {
  return (
    <article className="min-w-[260px] md:min-w-0 bg-background rounded-[28px] overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative w-full aspect-[4/3] bg-surface overflow-hidden">
        <img src={v.img} alt={v.name} loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold border border-border">
          {v.origin}
        </div>
        <div className="absolute bottom-3 left-3 bg-premium-black text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
          {v.badge}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-base mb-1">{v.name}</h3>
        <div className="text-muted-foreground text-xs mb-4">مدل {v.year}</div>
        <a href="#inquiry" className="w-full h-10 bg-surface hover:bg-premium-black hover:text-white rounded-full text-xs font-bold flex items-center justify-center transition-colors">
          استعلام قیمت
        </a>
      </div>
    </article>
  );
}

function FeaturedVehicles() {
  return (
    <section id="vehicles" className="py-12 bg-surface mx-3 rounded-[40px]">
      <div className="px-6 mb-6">
        <div className="text-brand-gold text-xs font-bold mb-2 flex items-center gap-1.5">
          <Sparkles className="size-3.5" />
          گالری خودروها
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">خودروهای ارس‌ترید</h2>
        <p className="text-sm text-muted-foreground">از موجود در انبار تا پیش‌فروش — هر سه گروه را ببینید.</p>
      </div>

      <Tabs defaultValue="ready" className="w-full">
        <div className="px-6">
          <TabsList dir="rtl" className="bg-background border border-border rounded-full h-12 p-1 w-full md:w-auto flex">
            <TabsTrigger value="ready" className="flex-1 rounded-full text-xs md:text-sm data-[state=active]:bg-premium-black data-[state=active]:text-white">
              آماده تحویل
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex-1 rounded-full text-xs md:text-sm data-[state=active]:bg-premium-black data-[state=active]:text-white">
              در حال واردات
            </TabsTrigger>
            <TabsTrigger value="preorder" className="flex-1 rounded-full text-xs md:text-sm data-[state=active]:bg-premium-black data-[state=active]:text-white">
              پیش‌فروش
            </TabsTrigger>
          </TabsList>
        </div>

        {(["ready", "shipping", "preorder"] as const).map((key) => (
          <TabsContent key={key} value={key} className="mt-6">
            <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible gap-5 px-6 pb-4 no-scrollbar">
              {vehicleGroups[key].map((v) => (
                <VehicleCard key={v.name + v.badge} v={v} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

function WorkProcess() {
  return (
    <section id="process" className="px-6 py-16">
      <div className="mb-8">
        <div className="text-brand-blue text-xs font-bold mb-2">فرآیند کار</div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">از درخواست تا تحویل</h2>
        <p className="text-sm text-muted-foreground max-w-md">شش گام شفاف برای واردات و ترخیص خودرو یا کالای شما.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {processSteps.map((s, i) => (
          <div key={s.n} className="relative bg-surface border border-border rounded-3xl p-6">
            <div className="absolute top-4 left-4 text-4xl font-extrabold text-foreground/5">{s.n}</div>
            <div className="size-11 rounded-xl bg-background border border-border grid place-items-center mb-4 text-brand-blue">
              <s.icon className="size-5" />
            </div>
            <h3 className="font-bold mb-1">{s.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            {i < processSteps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -left-2 size-4 rounded-full bg-brand-blue/20 border-2 border-background" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentActivities() {
  return (
    <section className="px-6 py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-brand-gold text-xs font-bold mb-2">به‌روزترین اقدامات</div>
          <h2 className="text-3xl font-extrabold tracking-tight">فعالیت‌های اخیر</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          زنده
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[32px] divide-y divide-border overflow-hidden">
        {activities.map((a, i) => (
          <div key={i} className="flex items-center gap-4 p-5">
            <div className={`size-11 rounded-2xl ${toneClasses[a.tone]} grid place-items-center shrink-0`}>
              <a.icon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm leading-relaxed">{a.text}</div>
            </div>
            <div className="text-[11px] text-muted-foreground shrink-0">{a.time}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhyUs() {
  return (
    <section className="px-6 py-12">
      <div className="bg-premium-black rounded-[40px] p-8 md:p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-blue/30 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-gold/20 blur-[80px]" />

        <div className="relative">
          <div className="text-brand-gold text-xs font-bold mb-3">چرا ارس‌ترید؟</div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
            انتخابی هوشمندانه برای
            <br />
            واردات و ترخیص
          </h2>
          <p className="text-white/60 text-sm mb-10 max-w-md leading-relaxed">
            تجربه، تخصص و شفافیت — سه دلیل اصلی اعتماد مشتریان حرفه‌ای به ما.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {whyItems.map((w) => (
              <div key={w.title} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="size-10 rounded-xl bg-brand-blue/20 text-brand-blue grid place-items-center mb-3">
                  <w.icon className="size-5" />
                </div>
                <div className="font-bold text-sm mb-1">{w.title}</div>
                <div className="text-[11px] text-white/50 leading-relaxed">{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InquiryForm() {
  const [loading, setLoading] = useState(false);
  const [reqType, setReqType] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const type = reqType;

    if (!name || !phone || !type) {
      toast.error("لطفاً نام، شماره تماس و نوع درخواست را تکمیل کنید");
      return;
    }
    if (!/^09\d{9}$/.test(phone)) {
      toast.error("شماره موبایل معتبر نیست");
      return;
    }

    setLoading(true);
    // TODO: connect to Supabase / CMS endpoint
    setTimeout(() => {
      toast.success("درخواست شما با موفقیت ثبت شد. به‌زودی تماس می‌گیریم.");
      form.reset();
      setReqType("");
      setLoading(false);
    }, 700);
  };

  return (
    <section id="inquiry" className="px-6 py-12">
      <div className="grid md:grid-cols-5 gap-6 items-start">
        <div className="md:col-span-2">
          <div className="text-brand-blue text-xs font-bold mb-2">استعلام سریع</div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">درخواست مشاوره</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            فرم را تکمیل کنید؛ کارشناسان ما در کمتر از ۲۴ ساعت با شما تماس می‌گیرند.
          </p>
          <div className="space-y-3">
            <a href={`tel:${contact.phone}`} className="flex items-center gap-3 bg-surface border border-border rounded-2xl p-4">
              <Phone className="size-5 text-brand-blue" />
              <div>
                <div className="text-[11px] text-muted-foreground">تماس مستقیم</div>
                <div className="font-bold text-sm" dir="ltr">{contact.phone}</div>
              </div>
            </a>
            <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-surface border border-border rounded-2xl p-4">
              <MessageCircle className="size-5 text-emerald-600" />
              <div>
                <div className="text-[11px] text-muted-foreground">واتس‌اپ</div>
                <div className="font-bold text-sm">پاسخ‌گویی سریع</div>
              </div>
            </a>
          </div>
        </div>

        <form onSubmit={onSubmit} className="md:col-span-3 bg-surface border border-border rounded-[32px] p-6 md:p-8 space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-2">نام و نام‌خانوادگی</label>
              <Input name="name" placeholder="مثلاً علی محمدی" className="bg-background h-12 rounded-2xl" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2">شماره موبایل</label>
              <Input name="phone" inputMode="numeric" placeholder="09123456789" className="bg-background h-12 rounded-2xl" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-2">نوع درخواست</label>
            <Select value={reqType} onValueChange={setReqType} dir="rtl">
              <SelectTrigger className="bg-background h-12 rounded-2xl w-full">
                <SelectValue placeholder="انتخاب خدمت موردنظر" />
              </SelectTrigger>
              <SelectContent>
                {requestTypes.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-2">توضیحات (اختیاری)</label>
            <Textarea name="note" rows={4} placeholder="مدل خودرو، کشور مبدأ یا توضیحات تکمیلی..." className="bg-background rounded-2xl" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-premium-black text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? "در حال ارسال..." : "ارسال درخواست"}
            {!loading && <ArrowLeft className="size-4" />}
          </button>

          <p className="text-[11px] text-muted-foreground text-center">
            با ارسال این فرم، با قوانین و حریم خصوصی ارس‌ترید موافقت می‌کنید.
          </p>
        </form>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="px-6 py-12">
      <div className="mb-8 text-center md:text-right">
        <div className="text-brand-blue text-xs font-bold mb-2">سؤالات متداول</div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">پاسخ به پرتکرارترین پرسش‌ها</h2>
        <p className="text-sm text-muted-foreground">اگر سؤال شما اینجا نیست، با ما تماس بگیرید.</p>
      </div>

      <Accordion type="single" collapsible className="bg-surface border border-border rounded-[32px] divide-y divide-border overflow-hidden">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="px-6 border-b-0">
            <AccordionTrigger className="text-right font-bold text-sm py-5 hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-4 sm:px-6 py-16">
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] border border-white/10 bg-[oklch(0.16_0.02_265)] shadow-[0_30px_80px_-30px_oklch(0.45_0.18_255/0.45)]">
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0">
          {/* World map dot pattern */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full opacity-[0.09]"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="cta-dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
                <circle cx="1.2" cy="1.2" r="1.2" fill="oklch(0.75 0.15 250)" />
              </pattern>
              <radialGradient id="cta-mask" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <mask id="cta-fade">
                <rect width="100%" height="100%" fill="url(#cta-mask)" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-dots)" mask="url(#cta-fade)" />
          </svg>
          {/* Glows */}
          <div className="absolute -top-24 -left-24 size-80 rounded-full bg-brand-blue/30 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 size-80 rounded-full bg-brand-blue/20 blur-3xl" />
          {/* Inner border highlight */}
          <div className="absolute inset-0 rounded-[32px] sm:rounded-[40px] ring-1 ring-inset ring-white/5" />
        </div>

        <div className="relative p-8 sm:p-12 lg:p-16">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-12 items-center">
            {/* Text column */}
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 mb-6">
                <span className="size-1.5 rounded-full bg-brand-blue shadow-[0_0_8px_oklch(0.6_0.2_255)]" />
                <span className="text-[11px] tracking-[0.25em] text-white/70 font-medium">ARAS TRADE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.35] text-white mb-5">
                خودروی رویایی شما،
                <br />
                یک تماس <span className="text-brand-blue">فاصله</span> دارد.
              </h2>
              <p className="text-white/65 text-sm sm:text-base leading-[2] max-w-lg mx-auto lg:mx-0 lg:ml-auto lg:mr-0 mb-8">
                همین حالا با ارس‌ترید تماس بگیرید و مشاوره رایگان واردات یا ترخیص خود را دریافت کنید.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 lg:justify-start justify-center">
                <a
                  href="https://wa.me/989000000000"
                  className="h-14 px-7 bg-brand-blue text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_14px_36px_-12px_oklch(0.6_0.2_255/0.7)] hover:brightness-110 transition active:scale-[0.98]"
                >
                  <MessageCircle className="size-5" />
                  واتساپ
                </a>
                <a
                  href="tel:+982188887777"
                  className="h-14 px-7 bg-white/[0.03] border border-white/15 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/[0.07] transition active:scale-[0.98]"
                >
                  <Phone className="size-5" />
                  تماس مستقیم
                </a>
              </div>
            </div>

            {/* Visual column — decorative neon A */}
            <div className="hidden lg:flex relative h-[320px] items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-[280px] rounded-full bg-brand-blue/15 blur-3xl" />
              </div>
              <svg
                viewBox="0 0 300 300"
                className="relative h-full w-auto drop-shadow-[0_0_30px_oklch(0.6_0.2_255/0.55)]"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="cta-a-stroke" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.75 0.18 255)" />
                    <stop offset="100%" stopColor="oklch(0.45 0.18 255)" />
                  </linearGradient>
                </defs>
                {/* Outer A */}
                <path
                  d="M150 30 L270 270 L210 270 L150 140 L90 270 L30 270 Z"
                  fill="none"
                  stroke="url(#cta-a-stroke)"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                {/* Inner A */}
                <path
                  d="M150 90 L222 250 L186 250 L150 168 L114 250 L78 250 Z"
                  fill="none"
                  stroke="oklch(0.6 0.2 255)"
                  strokeOpacity="0.55"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle cx="150" cy="195" r="3" fill="oklch(0.75 0.18 255)" />
              </svg>
            </div>
          </div>

          {/* Feature strip */}
          <div className="relative mt-12 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "ضمانت اصالت", desc: "۱۰۰٪ تضمینی" },
              { icon: Globe2, title: "واردات تخصصی", desc: "از اروپا، امارات و چین" },
              { icon: Gauge, title: "ترخیص سریع", desc: "در کمترین زمان ممکن" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 justify-center sm:justify-start">
                <div className="size-11 shrink-0 rounded-xl bg-white/[0.04] border border-white/10 grid place-items-center text-brand-blue">
                  <item.icon className="size-5" />
                </div>
                <div className="text-right">
                  <div className="text-white text-sm font-bold leading-tight">{item.title}</div>
                  <div className="text-white/55 text-xs mt-1">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 pt-12 pb-8 border-t border-border mt-8">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2">
          <div className="font-extrabold text-lg tracking-tight mb-3">
            ARAS<span className="text-brand-blue">TRADE</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            ارس‌ترید، متخصص واردات و ترخیص خودرو و کالای تجاری از منطقه آزاد ارس با شبکه‌ای از همکاران بین‌المللی.
          </p>
        </div>
        <div>
          <div className="font-bold text-sm mb-3">دسترسی سریع</div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><a href="#services" className="hover:text-foreground">خدمات</a></li>
            <li><a href="#vehicles" className="hover:text-foreground">خودروها</a></li>
            <li><a href="#process" className="hover:text-foreground">فرآیند کار</a></li>
            <li><a href="#faq" className="hover:text-foreground">سؤالات متداول</a></li>
          </ul>
        </div>
        <div>
          <div className="font-bold text-sm mb-3">تماس</div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="size-3.5" /> ۰۲۱-۸۸۸۸۷۷۷۷</li>
            <li className="flex items-center gap-2"><Send className="size-3.5" /> @arastrade</li>
            <li className="flex items-center gap-2"><Instagram className="size-3.5" /> @arastrade</li>
            <li className="flex items-start gap-2"><MapPin className="size-3.5 mt-0.5 shrink-0" /> منطقه آزاد ارس، جلفا</li>
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="text-[10px] text-muted-foreground">© ۱۴۰۳ ارس‌ترید • تمامی حقوق محفوظ است</div>
        <FileCheck className="size-4 text-brand-blue" />
      </div>
    </footer>
  );
}

function BottomNav() {
  return (
    <div className="fixed bottom-4 left-4 right-4 h-16 bg-premium-black/95 backdrop-blur-lg rounded-3xl flex items-center justify-around px-4 border border-white/10 md:hidden z-40 shadow-2xl">
      <a href="#" aria-label="خانه" className="size-10 grid place-items-center text-white/60">
        <Home className="size-5" />
      </a>
      <a href="#vehicles" aria-label="خودروها" className="size-10 grid place-items-center text-white/60">
        <Search className="size-5" />
      </a>
      <a href="#inquiry" aria-label="درخواست مشاوره" className="size-12 rounded-2xl bg-brand-blue grid place-items-center text-white shadow-lg shadow-brand-blue/40">
        <MessageCircle className="size-5" />
      </a>
      <a href="#services" aria-label="خدمات" className="size-10 grid place-items-center text-white/60">
        <Heart className="size-5" />
      </a>
      <Link to="/auth" aria-label="حساب کاربری" className="size-10 grid place-items-center text-white/60">
        <User className="size-5" />
      </Link>
    </div>
  );
}