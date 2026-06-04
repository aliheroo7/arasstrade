
-- ============================================================
-- Phase 2.2 — Customers, EPL, Inquiries
-- ============================================================

-- customers
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  company_name text,
  national_id text,
  company_id text,
  phone_verified boolean NOT NULL DEFAULT false,
  kyc_status text NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending','verified','rejected')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX idx_customers_user ON public.customers(user_id);

CREATE POLICY "Customers can view own record" ON public.customers
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Customers can insert own record" ON public.customers
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Customers can update own record" ON public.customers
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage customers" ON public.customers
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_customers'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_customers'));

-- Prevent customers from updating kyc_status / admin_notes (admin-only fields)
CREATE OR REPLACE FUNCTION public.tg_customers_protect_admin_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_permission(auth.uid(), 'manage_customers') THEN
    RETURN NEW;
  END IF;
  -- self-update: restore admin-managed fields
  NEW.kyc_status := OLD.kyc_status;
  NEW.admin_notes := OLD.admin_notes;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_customers_protect_admin_fields
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.tg_customers_protect_admin_fields();

-- ============================================================
-- epl_profiles
-- ============================================================
CREATE TABLE public.epl_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  epl_number text NOT NULL,
  owner_name text NOT NULL,
  national_or_company_id text,
  phone text,
  usage_type text NOT NULL DEFAULT 'personal' CHECK (usage_type IN ('personal','commercial','fleet')),
  notes text,
  verification_status text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending','verified','rejected')),
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, epl_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.epl_profiles TO authenticated;
GRANT ALL ON public.epl_profiles TO service_role;
ALTER TABLE public.epl_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_epl_updated_at BEFORE UPDATE ON public.epl_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX idx_epl_customer ON public.epl_profiles(customer_id);

-- Helper: get customer_id from user_id
CREATE OR REPLACE FUNCTION public.customer_id_for(_uid uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.customers WHERE user_id = _uid LIMIT 1;
$$;

CREATE POLICY "Customers can view own epl" ON public.epl_profiles
  FOR SELECT TO authenticated
  USING (customer_id = public.customer_id_for(auth.uid()));
CREATE POLICY "Customers can insert own epl" ON public.epl_profiles
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = public.customer_id_for(auth.uid()));
CREATE POLICY "Customers can update own unlocked epl" ON public.epl_profiles
  FOR UPDATE TO authenticated
  USING (customer_id = public.customer_id_for(auth.uid()) AND locked = false)
  WITH CHECK (customer_id = public.customer_id_for(auth.uid()));
CREATE POLICY "Admins manage epl" ON public.epl_profiles
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_customers'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_customers'));

-- EPL lock + reset trigger:
--   * Only admins (manage_customers) may set verification_status or locked or verified_*.
--   * When admin sets verification_status='verified' → locked=true, verified_by=actor, verified_at=now().
--   * When a customer edits any non-admin field, verification resets to pending and unlocks.
CREATE OR REPLACE FUNCTION public.tg_epl_lock_and_verify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  actor uuid := auth.uid();
  is_admin_actor boolean := actor IS NOT NULL AND public.has_permission(actor, 'manage_customers');
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Force safe defaults on insert from customer path
    IF NOT is_admin_actor THEN
      NEW.verification_status := 'pending';
      NEW.verified_by := NULL;
      NEW.verified_at := NULL;
      NEW.locked := false;
    END IF;
    RETURN NEW;
  END IF;

  IF NOT is_admin_actor THEN
    -- Customer update: restore admin-managed fields then reset verification
    NEW.verification_status := 'pending';
    NEW.verified_by := NULL;
    NEW.verified_at := NULL;
    NEW.locked := false;
    RETURN NEW;
  END IF;

  -- Admin update: handle verify transitions
  IF NEW.verification_status = 'verified' AND OLD.verification_status IS DISTINCT FROM 'verified' THEN
    NEW.locked := true;
    NEW.verified_by := actor;
    NEW.verified_at := now();
  ELSIF NEW.verification_status <> 'verified' AND OLD.verification_status = 'verified' THEN
    -- admin un-verifying clears verified_* and unlocks
    NEW.locked := false;
    NEW.verified_by := NULL;
    NEW.verified_at := NULL;
  END IF;

  RETURN NEW;
END $$;

CREATE TRIGGER trg_epl_lock_and_verify
BEFORE INSERT OR UPDATE ON public.epl_profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_epl_lock_and_verify();

-- ============================================================
-- inquiries
-- ============================================================
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('car-clearance','goods-import','preorder','consultation','other')),
  name text NOT NULL,
  phone text,
  email text,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_review','qualified','closed')),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'web' CHECK (source IN ('web','whatsapp','phone','other')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT INSERT ON public.inquiries TO anon;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_inquiries_updated_at BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX idx_inquiries_status ON public.inquiries(status);
CREATE INDEX idx_inquiries_customer ON public.inquiries(customer_id);

CREATE POLICY "Anon can submit inquiry" ON public.inquiries
  FOR INSERT TO anon WITH CHECK (customer_id IS NULL);
CREATE POLICY "Authenticated can submit own inquiry" ON public.inquiries
  FOR INSERT TO authenticated
  WITH CHECK (customer_id IS NULL OR customer_id = public.customer_id_for(auth.uid()));
CREATE POLICY "Customers can view own inquiries" ON public.inquiries
  FOR SELECT TO authenticated USING (customer_id = public.customer_id_for(auth.uid()));
CREATE POLICY "Admins manage inquiries" ON public.inquiries
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_inquiries'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_inquiries'));
