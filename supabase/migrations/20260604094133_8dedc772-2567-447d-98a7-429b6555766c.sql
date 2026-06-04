
-- ============================================================
-- Phase 2.5 — Public content schema
-- ============================================================

-- vehicles
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  brand text,
  model text,
  year integer,
  price_label text,
  status text NOT NULL DEFAULT 'ready'
    CHECK (status IN ('ready','shipping','preorder','sold','hidden')),
  summary text,
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE POLICY "Anyone reads published vehicles" ON public.vehicles
  FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins manage vehicles" ON public.vehicles
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_vehicles'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_vehicles'));

-- vehicle_images
CREATE TABLE public.vehicle_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  alt text,
  display_order integer NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicle_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_images TO authenticated;
GRANT ALL ON public.vehicle_images TO service_role;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_vehicle_images_updated_at BEFORE UPDATE ON public.vehicle_images
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX idx_vehicle_images_vehicle ON public.vehicle_images(vehicle_id);

CREATE POLICY "Anyone reads images of published vehicles" ON public.vehicle_images
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_id AND v.is_published));
CREATE POLICY "Admins manage vehicle images" ON public.vehicle_images
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_vehicles'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_vehicles'));

-- site_settings
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE POLICY "Anyone reads settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_settings'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_settings'));

-- site_content
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  locale text NOT NULL DEFAULT 'fa',
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (key, locale)
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_site_content_updated_at BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE POLICY "Anyone reads content" ON public.site_content
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage content" ON public.site_content
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_site_content'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_site_content'));

-- faqs
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_faqs_updated_at BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE POLICY "Anyone reads published faqs" ON public.faqs
  FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "Admins manage faqs" ON public.faqs
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_faq'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_faq'));

-- activity_feed
CREATE TABLE public.activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  icon text,
  published_at timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.activity_feed TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_feed TO authenticated;
GRANT ALL ON public.activity_feed TO service_role;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_activity_feed_updated_at BEFORE UPDATE ON public.activity_feed
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE POLICY "Anyone reads published activity" ON public.activity_feed
  FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "Admins manage activity" ON public.activity_feed
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_activity_feed'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_activity_feed'));

-- articles
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  body_md text,
  cover_path text,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  seo jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_articles_updated_at BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE POLICY "Anyone reads published articles" ON public.articles
  FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "Admins manage articles" ON public.articles
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_articles'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_articles'));
