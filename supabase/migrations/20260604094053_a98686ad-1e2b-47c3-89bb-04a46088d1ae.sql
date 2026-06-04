
-- ============================================================
-- Phase 2.4 — Documents + Audit Logs
-- ============================================================

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  epl_profile_id uuid REFERENCES public.epl_profiles(id) ON DELETE SET NULL,
  bucket text NOT NULL CHECK (bucket IN ('private-documents','customer-documents','epl-documents')),
  storage_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  category text NOT NULL DEFAULT 'other'
    CHECK (category IN ('passport','id','invoice','bill_of_lading','customs_decl','epl','other')),
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  visibility text NOT NULL DEFAULT 'customer' CHECK (visibility IN ('customer','internal')),
  verification_status text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending','verified','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX idx_documents_owner ON public.documents(owner_user_id);
CREATE INDEX idx_documents_case ON public.documents(case_id);
CREATE INDEX idx_documents_epl ON public.documents(epl_profile_id);

CREATE POLICY "Customers view own customer-visible docs" ON public.documents
  FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid() AND visibility = 'customer');
CREATE POLICY "Customers upload own docs" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid() AND uploaded_by = auth.uid() AND visibility = 'customer');
CREATE POLICY "Admins manage documents" ON public.documents
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_documents'))
  WITH CHECK (public.has_permission(auth.uid(), 'manage_documents'));

-- ============================================================
-- audit_logs (insert-only)
-- ============================================================
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role text,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_audit_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);

CREATE TRIGGER trg_audit_no_update BEFORE UPDATE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.tg_block_mutation();
CREATE TRIGGER trg_audit_no_delete BEFORE DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.tg_block_mutation();

CREATE POLICY "view_audit_logs can read" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'view_audit_logs'));
-- No INSERT/UPDATE/DELETE policy: trigger fns (SECURITY DEFINER) and service_role insert.

-- ============================================================
-- Helper to write an audit row from a trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.audit_write(
  _action text, _entity_type text, _entity_id uuid, _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), _action, _entity_type, _entity_id, _metadata);
END $$;

-- Audit triggers
CREATE OR REPLACE FUNCTION public.tg_audit_case_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.audit_write('case.status_changed', 'case', NEW.id,
      jsonb_build_object('from', OLD.status, 'to', NEW.status));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_audit_case_status
AFTER UPDATE OF status ON public.cases
FOR EACH ROW EXECUTE FUNCTION public.tg_audit_case_status();

CREATE OR REPLACE FUNCTION public.tg_audit_admin_assignments()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE role_slug text;
BEGIN
  SELECT slug INTO role_slug FROM public.roles WHERE id = COALESCE(NEW.role_id, OLD.role_id);
  PERFORM public.audit_write(
    'admin_assignment.' || lower(TG_OP),
    'admin_role_assignment',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'user_id', COALESCE(NEW.user_id, OLD.user_id),
      'role', role_slug,
      'is_active', COALESCE(NEW.is_active, OLD.is_active)
    )
  );
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_audit_admin_assignments
AFTER INSERT OR UPDATE OR DELETE ON public.admin_role_assignments
FOR EACH ROW EXECUTE FUNCTION public.tg_audit_admin_assignments();

CREATE OR REPLACE FUNCTION public.tg_audit_role_permissions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE role_slug text; perm_slug text;
BEGIN
  SELECT slug INTO role_slug FROM public.roles WHERE id = COALESCE(NEW.role_id, OLD.role_id);
  SELECT slug INTO perm_slug FROM public.permissions WHERE id = COALESCE(NEW.permission_id, OLD.permission_id);
  PERFORM public.audit_write(
    'role_permission.' || lower(TG_OP),
    'role_permission',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('role', role_slug, 'permission', perm_slug)
  );
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_audit_role_permissions
AFTER INSERT OR DELETE ON public.role_permissions
FOR EACH ROW EXECUTE FUNCTION public.tg_audit_role_permissions();

CREATE OR REPLACE FUNCTION public.tg_audit_epl_verification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    PERFORM public.audit_write('epl.verification_changed', 'epl_profile', NEW.id,
      jsonb_build_object('from', OLD.verification_status, 'to', NEW.verification_status));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_audit_epl_verification
AFTER UPDATE OF verification_status ON public.epl_profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_audit_epl_verification();

CREATE OR REPLACE FUNCTION public.tg_audit_customer_kyc()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.kyc_status IS DISTINCT FROM OLD.kyc_status THEN
    PERFORM public.audit_write('customer.kyc_changed', 'customer', NEW.id,
      jsonb_build_object('from', OLD.kyc_status, 'to', NEW.kyc_status));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_audit_customer_kyc
AFTER UPDATE OF kyc_status ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.tg_audit_customer_kyc();

CREATE OR REPLACE FUNCTION public.tg_audit_document_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.audit_write('document.uploaded', 'document', NEW.id,
    jsonb_build_object(
      'bucket', NEW.bucket, 'path', NEW.storage_path,
      'case_id', NEW.case_id, 'epl_profile_id', NEW.epl_profile_id,
      'category', NEW.category
    ));
  RETURN NEW;
END $$;
CREATE TRIGGER trg_audit_document_insert
AFTER INSERT ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.tg_audit_document_insert();
