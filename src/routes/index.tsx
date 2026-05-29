import { createFileRoute, Link } from "@tanstack/react-router";
import landCruiser from "@/assets/car-landcruiser.jpg";
import lexus from "@/assets/car-lexus.jpg";
import rangeRover from "@/assets/car-rangerover.jpg";
import cayenne from "@/assets/car-cayenne.jpg";
import gclass from "@/assets/car-gclass.jpg";
import bmwx7 from "@/assets/car-bmwx7.jpg";
import heroImport from "@/assets/hero-import.jpg";
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
  Sparkles,
  Home,
  Search,
  Heart,
  User,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ارس‌ترید | واردات هوشمند خودرو و کالای پریمیوم" },
      { name: "description", content: "پلتفرم پریمیوم واردات خودروهای لوکس و کالاهای جهانی از طریق منطقه آزاد ارس. ترخیص گمرکی، تامین و تحویل سراسری." },
      { property: "og:title", content: "ارس‌ترید | واردات هوشمند بدون واسطه" },
      { property: "og:description", content: "واردات مستقیم خودرو و کالای پریمیوم از طریق منطقه آزاد ارس." },
    ],
  }),
  component: Index,
});

const cars = [
  { name: "تویوتا لندکروزر VXR", year: "۲۰۲۰", price: "۲۸,۵۰۰,۰۰۰,۰۰۰", origin: "امارات 🇦🇪", eta: "تحویل ۱۴ روزه", badge: "موجود در انبار", badgeTone: "green", img: landCruiser },
  { name: "لکسوس LX 570", year: "۲۰۱۹", price: "۲۴,۹۰۰,۰۰۰,۰۰۰", origin: "ژاپن 🇯🇵", eta: "تحویل ۱۸ روزه", badge: "در حال حمل", badgeTone: "gold", img: lexus },
  { name: "رنج‌روور وگ Autobiography", year: "۲۰۱۸", price: "۲۲,۳۰۰,۰۰۰,۰۰۰", origin: "انگلستان 🇬🇧", eta: "تحویل ۲۰ روزه", badge: "پیش‌فروش", badgeTone: "blue", img: rangeRover },
  { name: "پورشه کاین توربو", year: "۲۰۱۷", price: "۱۸,۷۰۰,۰۰۰,۰۰۰", origin: "آلمان 🇩🇪", eta: "تحویل ۱۶ روزه", badge: "موجود", badgeTone: "green", img: cayenne },
  { name: "مرسدس بنز G500", year: "۲۰۲۱", price: "۴۵,۰۰۰,۰۰۰,۰۰۰", origin: "آلمان 🇩🇪", eta: "تحویل ۲۱ روزه", badge: "پیش‌سفارش", badgeTone: "gold", img: gclass },
  { name: "BMW X7 xDrive40i", year: "۲۰۲۰", price: "۲۶,۸۰۰,۰۰۰,۰۰۰", origin: "آلمان 🇩🇪", eta: "تحویل ۱۵ روزه", badge: "موجود", badgeTone: "green", img: bmwx7 },
  { name: "لندکروزر کلاسیک", year: "۲۰۱۰", price: "۱۰,۴۰۰,۰۰۰,۰۰۰", origin: "امارات 🇦🇪", eta: "تحویل ۱۲ روزه", badge: "تک‌موجودی", badgeTone: "blue", img: landCruiser },
];

const badgeStyles: Record<string, string> = {
  green: "bg-emerald-500/10 text-emerald-600",
  gold: "bg-brand-gold/10 text-brand-gold",
  blue: "bg-brand-blue/10 text-brand-blue",
};

const steps = [
  { n: "۰۱", title: "ثبت درخواست", desc: "ارسال مدل و سال خودروی موردنظر یا لینک کالا", icon: FileCheck },
  { n: "۰۲", title: "تامین و خرید بین‌المللی", desc: "خرید مستقیم از بازارهای جهانی توسط تیم ما", icon: Package },
  { n: "۰۳", title: "ترخیص گمرکی ارس", desc: "انجام تمامی امور قانونی در گمرک منطقه آزاد ارس", icon: ShieldCheck },
  { n: "۰۴", title: "تحویل سراسری", desc: "ارسال ایمن و بیمه‌شده به درب منزل شما", icon: Truck },
];

const stats = [
  { value: "+۵۰۰", label: "خودرو ترخیص شده" },
  { value: "+۱۲۰۰", label: "سفارش موفق" },
  { value: "۹۸٪", label: "رضایت مشتریان" },
  { value: "۴۸ ساعت", label: "میانگین ترخیص" },
];

const testimonials = [
  { name: "دکتر علیرضا کریمی", role: "مدیرعامل گروه صنعتی", text: "شفافیت در قیمت‌گذاری و سرعت ترخیص واقعاً متفاوت بود. لندکروزر من دقیقاً سر زمان وعده داده شده تحویل شد." },
  { name: "مهندس سارا موسوی", role: "خریدار خصوصی", text: "تجربه‌ای کاملاً متفاوت از خرید یک کاین. تیم ارس‌ترید از انتخاب تا تحویل کنارم بودند." },
];

function Index() {
  return (
    <div dir="rtl" className="font-sans bg-background text-foreground min-h-screen pb-28">
      <Navbar />
      <Hero />
      <StatsStrip />
      <FeaturedCars />
      <PreOrder />
      <Services />
      <Trust />
      <Contact />
      <Footer />
      <BottomNav />
    </div>
  );
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-6 h-16 flex items-center justify-between">
      <a href="#" className="font-extrabold text-xl tracking-tight text-premium-black">
        ARASS<span className="text-brand-blue">TRADE</span>
      </a>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <a href="#products" className="hover:text-foreground transition">خودروها</a>
        <a href="#preorder" className="hover:text-foreground transition">پیش‌سفارش</a>
        <a href="#services" className="hover:text-foreground transition">خدمات</a>
        <a href="#contact" className="hover:text-foreground transition">تماس</a>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/auth" className="hidden md:inline-flex h-10 items-center px-4 rounded-full border border-border text-sm font-semibold">
          ورود / ثبت‌نام
        </Link>
        <Link to="/auth" aria-label="حساب کاربری" className="size-10 rounded-full bg-surface grid place-items-center border border-border md:hidden">
          <User className="size-4" />
        </Link>
        <a href="#contact" className="hidden md:inline-flex h-10 items-center px-5 rounded-full bg-premium-black text-primary-foreground text-sm font-semibold">ثبت سفارش</a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="px-6 pt-12 pb-10 overflow-hidden relative">
      <div className="absolute -top-20 -left-20 size-72 rounded-full bg-brand-blue/10 blur-3xl pointer-events-none" />
      <div className="absolute top-40 -right-32 size-72 rounded-full bg-brand-gold/10 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-medium mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue" />
          </span>
          منطقه آزاد ارس
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.15] mb-5 tracking-tight">
          واردات هوشمند خودرو،
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-brand-blue to-blue-400">
            بی‌واسطه از جهان
          </span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-[460px]">
          اولین پلتفرم پریمیوم واردات خودروهای لوکس، کالای جهانی و ترخیص گمرکی در شمال غرب کشور.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md">
          <a href="#products" className="h-14 px-6 bg-premium-black text-primary-foreground rounded-2xl font-bold text-base shadow-xl shadow-premium-black/10 active:scale-95 transition-transform flex items-center justify-center gap-2">
            مشاهده خودروها
            <ArrowLeft className="size-4" />
          </a>
          <a href="#contact" className="h-14 px-6 bg-background border border-border text-foreground rounded-2xl font-semibold active:scale-95 transition-transform flex items-center justify-center">
            ثبت سفارش اختصاصی
          </a>
        </div>

        <div className="mt-12 relative rounded-[32px] overflow-hidden border border-border shadow-2xl shadow-premium-black/10">
          <img
            src={heroImport}
            alt="خودروی لوکس وارداتی در انبار منطقه آزاد ارس"
            width={1200}
            height={1400}
            className="w-full h-auto object-cover"
          />
          <div className="absolute bottom-4 right-4 left-4 bg-background/80 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between border border-border">
            <div>
              <div className="text-xs text-muted-foreground">آخرین ورودی انبار</div>
              <div className="font-bold">رولزرویس کالینان • ۲۰۲۲</div>
            </div>
            <div className="text-xs bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-full font-bold">ترخیص شد</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    <section className="px-6 py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface p-4 rounded-3xl border border-border">
            <div className="text-2xl font-bold mb-1">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedCars() {
  return (
    <section id="products" className="pt-14">
      <div className="px-6 flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">خودروهای پیشنهادی</h2>
          <p className="text-sm text-muted-foreground mt-1">از لندکروزر تا G-Class — مدل ۲۰۱۰ به بالا</p>
        </div>
        <a href="#" className="text-brand-blue text-sm font-medium hidden sm:inline">مشاهده همه</a>
      </div>

      <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible gap-5 px-6 pb-6 no-scrollbar">
        {cars.map((car) => (
          <article key={car.name} className="min-w-[280px] md:min-w-0 bg-background rounded-[32px] overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="relative w-full aspect-square bg-surface overflow-hidden">
              <img src={car.img} alt={car.name} loading="lazy" width={800} height={800} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold border border-border">
                {car.origin}
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="font-bold text-base leading-snug">{car.name}</h3>
                <span className={`shrink-0 text-[10px] ${badgeStyles[car.badgeTone]} px-2 py-0.5 rounded-full font-bold whitespace-nowrap`}>{car.badge}</span>
              </div>
              <div className="text-muted-foreground text-xs mb-4">مدل {car.year} • {car.eta}</div>
              <div className="flex justify-between items-center">
                <div className="font-bold text-base">
                  {car.price}
                  <span className="text-[10px] text-muted-foreground font-normal mr-1">تومان</span>
                </div>
                <a href="https://wa.me/989000000000" aria-label="سفارش در واتس‌اپ" className="size-10 bg-brand-blue rounded-full grid place-items-center text-white hover:scale-110 transition-transform">
                  <MessageCircle className="size-4" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PreOrder() {
  const items = [
    { name: "مرسدس بنز GLE 450", country: "آلمان", days: "۷" },
    { name: "لکسوس RX 500h", country: "ژاپن", days: "۱۲" },
    { name: "بنتلی بنتایگا", country: "انگلستان", days: "۱۸" },
  ];
  return (
    <section id="preorder" className="px-6 py-16 bg-surface mt-16 rounded-[40px] mx-3">
      <div className="flex items-center gap-2 text-brand-gold text-xs font-bold mb-2">
        <Sparkles className="size-4" />
        محصولات در راه
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight mb-2">پیش‌سفارش هوشمند</h2>
      <p className="text-muted-foreground text-sm mb-8 max-w-md">با پرداخت بیعانه، خودروی موردنظر را قبل از رسیدن به انبار رزرو کنید.</p>

      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.name} className="bg-background rounded-3xl p-5 border border-border flex items-center justify-between">
            <div>
              <div className="font-bold mb-1">{it.name}</div>
              <div className="text-xs text-muted-foreground">حمل از {it.country}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-brand-blue">{it.days}</div>
              <div className="text-[10px] text-muted-foreground">روز تا ورود</div>
            </div>
            <button className="h-10 px-4 bg-premium-black text-primary-foreground rounded-full text-xs font-bold">رزرو</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="px-6 py-16">
      <div className="bg-premium-black rounded-[40px] p-8 md:p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-blue/30 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-gold/20 blur-[80px]" />

        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
            خدمات کارگزاری
            <br />
            ارس‌ترید
          </h2>
          <p className="text-white/60 text-sm mb-10 leading-relaxed max-w-md">
            صفر تا صد واردات — از خرید در بازارهای جهانی تا تحویل درب منزل شما.
          </p>

          <div className="space-y-5">
            {steps.map((s) => (
              <div key={s.n} className="flex gap-4 items-center">
                <div className="size-12 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-brand-blue">
                  <s.icon className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-2">
                    <span className="text-white/40 text-xs">{s.n}</span>
                    {s.title}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <a href="#contact" className="mt-10 w-full h-12 bg-background text-foreground rounded-2xl font-bold flex items-center justify-center">
            درخواست مشاوره رایگان
          </a>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section className="px-6 py-12">
      <h2 className="text-3xl font-extrabold tracking-tight mb-2">چرا ارس‌ترید؟</h2>
      <p className="text-muted-foreground text-sm mb-8">اعتماد بیش از هزار مشتری حرفه‌ای در سراسر کشور.</p>

      <div className="space-y-4">
        {testimonials.map((t) => (
          <figure key={t.name} className="bg-surface rounded-3xl p-6 border border-border">
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="size-1.5 rounded-full bg-brand-gold" />
              ))}
            </div>
            <blockquote className="text-sm leading-relaxed text-foreground mb-5">«{t.text}»</blockquote>
            <figcaption className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-gold" />
              <div>
                <div className="text-xs font-bold">{t.name}</div>
                <div className="text-[10px] text-muted-foreground">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const channels = [
    { label: "واتس‌اپ", value: "پیام مستقیم", icon: MessageCircle, href: "https://wa.me/989000000000" },
    { label: "تلگرام", value: "@arastrade", icon: Send, href: "https://t.me/arastrade" },
    { label: "اینستاگرام", value: "@arastrade", icon: Instagram, href: "https://instagram.com/arastrade" },
    { label: "تماس مستقیم", value: "۰۲۱-۸۸۸۸۷۷۷۷", icon: Phone, href: "tel:+982188887777" },
  ];
  return (
    <section id="contact" className="px-6 py-12">
      <h2 className="text-3xl font-extrabold tracking-tight mb-2">تماس با ما</h2>
      <p className="text-muted-foreground text-sm mb-8">تیم پشتیبانی ارس‌ترید پاسخگوی شماست.</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {channels.map((c) => (
          <a key={c.label} href={c.href} className="bg-surface border border-border rounded-3xl p-5 hover:border-brand-blue transition-colors">
            <c.icon className="size-5 text-brand-blue mb-3" />
            <div className="font-bold text-sm">{c.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{c.value}</div>
          </a>
        ))}
      </div>

      <div className="bg-surface rounded-3xl p-5 border border-border flex items-start gap-3">
        <MapPin className="size-5 text-brand-gold shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-sm mb-1">دفتر مرکزی</div>
          <div className="text-xs text-muted-foreground leading-relaxed">منطقه آزاد ارس، جلفا، فاز یک، مجتمع تجاری ارس‌ترید</div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 pt-12 pb-8 border-t border-border mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="font-extrabold text-lg tracking-tight">
          ARASS<span className="text-brand-blue">TRADE</span>
        </div>
        <div className="text-[10px] text-muted-foreground tracking-widest">© ۱۴۰۳</div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
        تمامی حقوق مادی و معنوی این وب‌سایت متعلق به مجموعه ارس‌ترید است.
      </p>
    </footer>
  );
}

function BottomNav() {
  return (
    <div className="fixed bottom-4 left-4 right-4 h-16 bg-premium-black/95 backdrop-blur-lg rounded-3xl flex items-center justify-around px-4 border border-white/10 md:hidden z-40 shadow-2xl">
      <a href="#" className="size-10 grid place-items-center text-white/60">
        <Home className="size-5" />
      </a>
      <a href="#products" className="size-10 grid place-items-center text-white/60">
        <Search className="size-5" />
      </a>
      <a href="#contact" className="size-12 rounded-2xl bg-brand-blue grid place-items-center text-white shadow-lg shadow-brand-blue/40">
        <MessageCircle className="size-5" />
      </a>
      <a href="#preorder" className="size-10 grid place-items-center text-white/60">
        <Heart className="size-5" />
      </a>
      <Link to="/auth" className="size-10 grid place-items-center text-white/60">
        <User className="size-5" />
      </Link>
    </div>
  );
}
