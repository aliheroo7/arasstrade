## Plan — Redesign Final CTA section only

**Scope:** `src/routes/index.tsx`, only the `FinalCTA` function (lines 701–730). No other section, no routing/auth/backend touched.

### Visual goal (matches uploaded reference)
A premium dark cinematic card with rounded-3xl/4xl container, deep black background, blue neon accents, faint world-map/logistics texture, and a subtle blue glow ring. RTL preserved. All text remains real HTML; buttons remain `<a>` elements; icons remain lucide-react components.

### New layout

```
section (px-4 sm:px-6 py-16)
└── div  (rounded-[32px] border border-white/10 bg-premium-black overflow-hidden relative)
    ├── background layers (absolute, pointer-events-none):
    │   • SVG world-map dot pattern at ~8% opacity, positioned center-left
    │   • Radial blue glow top-right (brand-blue/25 blur-3xl)
    │   • Soft blue gradient sweep bottom-right
    │   • Thin neon blue border highlight via inset ring
    ├── content grid (relative, p-8 sm:p-12 lg:p-16, grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center)
    │   ├── Text column (text-right, rtl natural):
    │   │   • Small brand chip: «ARAS TRADE» with blue dot
    │   │   • H2: "خودروی رویایی شما،" <br/> "یک تماس <span text-brand-blue>فاصله</span> دارد."
    │   │     text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.3] text-white
    │   │   • Subtitle: existing copy, text-white/65 text-sm sm:text-base max-w-lg
    │   │   • Buttons row (flex flex-col sm:flex-row gap-3):
    │   │       - واتساپ → bg-brand-blue text-white h-14 rounded-2xl, MessageCircle icon, shadow-[0_12px_40px_-12px_brand-blue]
    │   │       - تماس مستقیم → bg-transparent border border-white/15 text-white h-14 rounded-2xl, Phone icon
    │   └── Visual column (hidden on small, lg:block):
    │       • Decorative neon "A" triangle built with CSS (two angled borders in brand-blue with blur glow)
    │       • Behind it: faint world map SVG + small dots
    │       • No raster image used; pure CSS/SVG to stay lightweight
    └── Feature strip (relative, mt-10 pt-6 border-t border-white/10, grid grid-cols-1 sm:grid-cols-3 gap-6):
        Each item: icon in rounded-xl bg-white/5 border-white/10 + title (text-white text-sm font-bold) + subtitle (text-white/55 text-xs)
        1. ShieldCheck → ضمانت اصالت / ۱۰۰٪ تضمینی
        2. Globe       → واردات تخصصی / از اروپا، امارات و چین
        3. Gauge       → ترخیص سریع / در کمترین زمان ممکن
```

### Specifics
- Container: `rounded-[32px] sm:rounded-[40px] border border-white/10 bg-[oklch(0.16_0.02_265)] shadow-[0_30px_80px_-30px_oklch(0.45_0.18_255/0.45)]`
- World-map background: inline SVG of small dots forming a faint map silhouette, `opacity-[0.08]`, masked to fade toward edges.
- Neon "A" decoration uses two skewed divs with `border-brand-blue` and `shadow-[0_0_40px_brand-blue]`.
- Mobile (< lg): visual column hidden; text centered (`lg:text-right text-center`), buttons full-width stacked, feature strip becomes 1-column.
- All colors via existing tokens (`brand-blue`, `premium-black`, `white/x`). No new tokens.
- Icons: replace existing `Phone`/`MessageCircle` imports usage (already imported); add `Globe`, `Gauge` (verify in existing imports — `ShieldCheck` already used elsewhere).

### Imports check
Add to existing lucide-react import if missing: `Globe`, `Gauge`, `ShieldCheck`. (Will verify and add only ones not present.)

### Out of scope
Everything outside `FinalCTA`. No changes to Footer, BottomNav, Hero, Services, Vehicles, FAQ, forms, routing, auth, Supabase, styles.css.
