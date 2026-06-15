
-- 1) Customers: also restore phone_verified on self-update
CREATE OR REPLACE FUNCTION public.tg_customers_protect_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR public.has_permission(auth.uid(), 'manage_customers') THEN
    RETURN NEW;
  END IF;
  NEW.kyc_status    := OLD.kyc_status;
  NEW.admin_notes   := OLD.admin_notes;
  NEW.phone_verified := OLD.phone_verified;
  RETURN NEW;
END $function$;

-- 2) site_settings: gate public reads behind explicit is_public flag
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Anyone reads settings" ON public.site_settings;

CREATE POLICY "Public reads public settings"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Admins read all settings"
  ON public.site_settings
  FOR SELECT
  TO authenticated
  USING (public.has_permission(auth.uid(), 'manage_settings'));

-- 3) Storage: add documents-table ownership join (defense in depth alongside path check)
DROP POLICY IF EXISTS "cust_docs_owner_select" ON storage.objects;
CREATE POLICY "cust_docs_owner_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'customer-documents'
    AND (auth.uid())::text = (storage.foldername(name))[2]
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.bucket = 'customer-documents'
        AND d.storage_path = storage.objects.name
        AND d.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "cust_docs_owner_update" ON storage.objects;
CREATE POLICY "cust_docs_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'customer-documents'
    AND (auth.uid())::text = (storage.foldername(name))[2]
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.bucket = 'customer-documents'
        AND d.storage_path = storage.objects.name
        AND d.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "cust_docs_owner_delete" ON storage.objects;
CREATE POLICY "cust_docs_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'customer-documents'
    AND (auth.uid())::text = (storage.foldername(name))[2]
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.bucket = 'customer-documents'
        AND d.storage_path = storage.objects.name
        AND d.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "epl_docs_owner_select" ON storage.objects;
CREATE POLICY "epl_docs_owner_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'epl-documents'
    AND (auth.uid())::text = (storage.foldername(name))[2]
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.bucket = 'epl-documents'
        AND d.storage_path = storage.objects.name
        AND d.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "epl_docs_owner_update" ON storage.objects;
CREATE POLICY "epl_docs_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'epl-documents'
    AND (auth.uid())::text = (storage.foldername(name))[2]
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.bucket = 'epl-documents'
        AND d.storage_path = storage.objects.name
        AND d.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "epl_docs_owner_delete" ON storage.objects;
CREATE POLICY "epl_docs_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'epl-documents'
    AND (auth.uid())::text = (storage.foldername(name))[2]
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.bucket = 'epl-documents'
        AND d.storage_path = storage.objects.name
        AND d.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "priv_docs_owner_select" ON storage.objects;
CREATE POLICY "priv_docs_owner_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'private-documents'
    AND (auth.uid())::text = (storage.foldername(name))[2]
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.bucket = 'private-documents'
        AND d.storage_path = storage.objects.name
        AND d.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "priv_docs_owner_update" ON storage.objects;
CREATE POLICY "priv_docs_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'private-documents'
    AND (auth.uid())::text = (storage.foldername(name))[2]
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.bucket = 'private-documents'
        AND d.storage_path = storage.objects.name
        AND d.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "priv_docs_owner_delete" ON storage.objects;
CREATE POLICY "priv_docs_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'private-documents'
    AND (auth.uid())::text = (storage.foldername(name))[2]
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.bucket = 'private-documents'
        AND d.storage_path = storage.objects.name
        AND d.owner_user_id = auth.uid()
    )
  );

-- 4) Revoke EXECUTE on internal SECURITY DEFINER helpers from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.audit_write(text, text, uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_audit_admin_assignments() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_audit_role_permissions() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_audit_document_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_audit_case_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_audit_epl_verification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_audit_customer_kyc() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_cases_log_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_protect_system_roles() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_protect_admin_assignments() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_customers_protect_admin_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_epl_lock_and_verify() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_protect_role_permissions() FROM PUBLIC, anon, authenticated;
