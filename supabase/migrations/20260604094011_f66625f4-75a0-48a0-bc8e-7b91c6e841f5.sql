
-- ============================================================
-- Phase 2.3 — Cases, status history, messages
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS public.case_code_seq;

CREATE OR REPLACE FUNCTION public.generate_case_code()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE n bigint;
BEGIN
  n := nextval('public.case_code_seq');
  RETURN 'ARS-' || to_char(now(), 'YYYY') || '-' || lpad(n::text, 6, '0');
END $$;

CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS text LANGUAGE sql AS $$
  SELECT upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 10));
$$;

-- cases
CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  case_code text NOT NULL UNIQUE,
  tracking_code text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('vehicle_clearance','vehicle_import','commercial_import','commercial_clearance')),
  title text NOT NULL,
  summary text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','opened','documents_pending','in_customs','cleared','delivered','closed','cancelled')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  epl_profile_id uuid REFERENCES public.epl_profiles(id) ON DELETE SET NULL,
  opened_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases TO authenticated;
GRANT ALL ON public.cases TO service_role;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_cases_updated_at BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX idx_cases_customer ON public.cases(customer_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_assigned ON public.cases(assigned_to);

-- Auto-fill case_code + tracking_code
CREATE OR REPLACE FUNCTION public.tg_cases_autofill()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.case_code IS NULL OR NEW.case_code = '' THEN
    NEW.case_code := public.generate_case_code();
  END IF;
  IF NEW.tracking_code IS NULL OR NEW.tracking_code = '' THEN
    NEW.tracking_code := public.generate_tracking_code();
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_cases_autofill
BEFORE INSERT ON public.cases
FOR EACH ROW EXECUTE FUNCTION public.tg_cases_autofill();

-- ============================================================
-- case_status_history (insert-only)
-- ============================================================
CREATE TABLE public.case_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.case_status_history TO authenticated;
GRANT ALL ON public.case_status_history TO service_role;
ALTER TABLE public.case_status_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_csh_case ON public.case_status_history(case_id);

-- Block UPDATE/DELETE
CREATE OR REPLACE FUNCTION public.tg_block_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Rows in % are immutable', TG_TABLE_NAME;
END $$;
CREATE TRIGGER trg_csh_no_update BEFORE UPDATE ON public.case_status_history
  FOR EACH ROW EXECUTE FUNCTION public.tg_block_mutation();
CREATE TRIGGER trg_csh_no_delete BEFORE DELETE ON public.case_status_history
  FOR EACH ROW EXECUTE FUNCTION public.tg_block_mutation();

-- Auto-log status change
CREATE OR REPLACE FUNCTION public.tg_cases_log_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.case_status_history (case_id, from_status, to_status, changed_by, note)
    VALUES (NEW.id, NULL, NEW.status, auth.uid(), 'created');
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.case_status_history (case_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_cases_log_status
AFTER INSERT OR UPDATE OF status ON public.cases
FOR EACH ROW EXECUTE FUNCTION public.tg_cases_log_status();

-- ============================================================
-- case_messages
-- ============================================================
CREATE TABLE public.case_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('customer','admin','system')),
  body text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_messages TO authenticated;
GRANT ALL ON public.case_messages TO service_role;
ALTER TABLE public.case_messages ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_case_messages_updated_at BEFORE UPDATE ON public.case_messages
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX idx_case_messages_case ON public.case_messages(case_id);

-- ============================================================
-- RLS for cases / history / messages
-- ============================================================

-- cases
CREATE POLICY "Customers view own cases" ON public.cases
  FOR SELECT TO authenticated
  USING (customer_id = public.customer_id_for(auth.uid()));
CREATE POLICY "Admins manage cases" ON public.cases
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_cases'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_cases'));

-- case_status_history
CREATE POLICY "Customers view own case history" ON public.case_status_history
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.cases c
    WHERE c.id = case_id AND c.customer_id = public.customer_id_for(auth.uid())
  ));
CREATE POLICY "Admins view case history" ON public.case_status_history
  FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_cases'));
-- Writes only via trigger (no INSERT policy => only service_role / SECURITY DEFINER trigger can insert)
-- Trigger function uses SECURITY DEFINER so it bypasses RLS — INSERT will succeed.

-- case_messages
CREATE POLICY "Customers view own non-internal messages" ON public.case_messages
  FOR SELECT TO authenticated
  USING (
    is_internal = false
    AND EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_id AND c.customer_id = public.customer_id_for(auth.uid())
    )
  );
CREATE POLICY "Customers insert own messages" ON public.case_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    is_internal = false
    AND sender_role = 'customer'
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = case_id AND c.customer_id = public.customer_id_for(auth.uid())
    )
  );
CREATE POLICY "Admins manage messages" ON public.case_messages
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_cases'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_cases'));
