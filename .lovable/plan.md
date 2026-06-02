## Hero Refinement Plan — ارس‌ترید

Scope: Only the `Hero` component in `src/routes/index.tsx` (lines ~234–297). No other section, route, or backend touched. Tokens and palette unchanged.

### 1. Mobile order fix (critical)
Reorder content stack so users read business message before seeing the image:
1. Status badge (منطقه آزاد ارس • فعال)
2. Headline (3-line staggered reveal)
3. Subtitle
4. Primary CTA — درخواست مشاوره ترخیص خودرو
5. Secondary CTA — مشاهده خودروها
6. Hero image (last, full width, rounded)

Implementation: drop the current `order-1 / order-2` inversion so on mobile text comes first naturally; on `lg:` use grid with text right-column, image left-column.

Center-align text on mobile (`text-center`), right-align from `lg:` up.

### 2. Desktop composition (unified premium block)
- Replace 6/6 split with an art-directed asymmetric grid: `lg:grid-cols-12` → text `col-span-7`, image `col-span-5`, `gap-14`, `items-stretch`.
- Image fills column height (`h-full`, `aspect-auto lg:aspect-[4/5]`) so both columns share the same vertical rhythm.
- Add a soft connecting band: subtle horizontal gradient line / faint grid behind both columns plus a small "credential strip" (e.g. سال تأسیس • گمرک ارس • مجوز رسمی) sitting under the CTAs to bridge text↔image visually.
- Replace the existing "آخرین ترخیص موفق" floating card with a more corporate logistics overlay: container/anchor icon + label "ترخیص و ترانزیت • منطقه آزاد ارس" + a small KPI chip ("+۵۰۰ پرونده موفق"). Moves feel away from showroom toward trade/logistics.
- Tighten section padding: `pt-16 lg:pt-24 pb-20 lg:pb-28`, increase max-width breathing with `max-w-7xl` retained but add `lg:px-10`.
- Reduce decorative blur blobs (keep one subtle blue blob top-left, drop gold blob) so the hero feels corporate not flashy.

### 3. Typography refinement
- Headline becomes a 3-line staggered reveal (Vazirmatn, keep semantic H1):
  - Line 1: «واردات و ترخیص تخصصی»
  - Line 2: «خودرو و کالای تجاری»
  - Line 3 (accent, brand-blue): «از منطقه آزاد ارس»
- Sizes: `text-[2rem] sm:text-[2.5rem] lg:text-[3.25rem]`, `leading-[1.25]`, `tracking-tight`, weight `font-bold` (drop `font-extrabold` on accent line to keep refined feel).
- Subtitle: `text-[15px] lg:text-[17px] leading-[2] text-muted-foreground max-w-[34rem]`, slightly looser letter-spacing on the accent line only.
- Small uppercase eyebrow above headline (latin): `ARAS TRADE — INTERNATIONAL TRADE & CUSTOMS` in `text-[11px] tracking-[0.25em] text-muted-foreground` to anchor corporate tone (latin string only; rest stays Persian).

### 4. CTA hierarchy
- Primary: filled `bg-premium-black`, `h-14`, `rounded-2xl`, stronger shadow (`shadow-[0_10px_30px_-10px_oklch(0.18_0.005_270/0.45)]`), arrow icon, slight hover lift.
- Secondary: ghost/outline, same height, `text-foreground/80`, no shadow; visually clearly subordinate.
- Add a thin trust line under CTAs: shield icon + «مشاوره رایگان • بدون تعهد» in `text-xs text-muted-foreground`.

### 5. Subtle premium animation
Use existing Tailwind keyframes from `src/styles.css` (`animate-fade-in`) plus inline `style={{ animationDelay }}` for stagger. No new deps, no bounce/rotate.

Reveal sequence (all `animate-fade-in`, 600ms ease-out):
- Badge: delay 0ms
- Headline line 1: 120ms
- Headline line 2: 240ms
- Headline line 3: 360ms
- Subtitle: 480ms
- CTAs: 600ms
- Trust microline: 720ms
- Image block: 200ms (fade-in only, no transform)

Each element gets `opacity-0 animate-fade-in` with `animationFillMode: 'forwards'`.

### 6. What does NOT change
- All other sections (TrustStrip, MainServices, FeaturedVehicles, WorkProcess, RecentActivities, WhyUs, InquiryForm, FAQ, FinalCTA, Footer, BottomNav, Navbar).
- Routing, auth, dashboard, Supabase, styles.css tokens, color palette, fonts.
- Data arrays at top of file.

### Files touched
- `src/routes/index.tsx` — only the `Hero` function (and unused icon imports adjusted if needed).
