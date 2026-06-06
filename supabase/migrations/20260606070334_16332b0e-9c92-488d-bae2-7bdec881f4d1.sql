
-- Storage policies for buckets (vehicle-media & site-media public-read since workspace blocks public buckets)

-- private-documents: owner = customers/{user_id}/...
CREATE POLICY "priv_docs_owner_select" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'private-documents' AND auth.uid()::text = (storage.foldername(name))[2]);
CREATE POLICY "priv_docs_owner_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'private-documents' AND auth.uid()::text = (storage.foldername(name))[2]);
CREATE POLICY "priv_docs_owner_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'private-documents' AND auth.uid()::text = (storage.foldername(name))[2]);
CREATE POLICY "priv_docs_owner_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'private-documents' AND auth.uid()::text = (storage.foldername(name))[2]);
CREATE POLICY "priv_docs_admin_all" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'private-documents' AND public.has_permission(auth.uid(), 'manage_documents'))
WITH CHECK (bucket_id = 'private-documents' AND public.has_permission(auth.uid(), 'manage_documents'));

-- customer-documents
CREATE POLICY "cust_docs_owner_select" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'customer-documents' AND auth.uid()::text = (storage.foldername(name))[2]);
CREATE POLICY "cust_docs_owner_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'customer-documents' AND auth.uid()::text = (storage.foldername(name))[2]);
CREATE POLICY "cust_docs_owner_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'customer-documents' AND auth.uid()::text = (storage.foldername(name))[2]);
CREATE POLICY "cust_docs_owner_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'customer-documents' AND auth.uid()::text = (storage.foldername(name))[2]);
CREATE POLICY "cust_docs_admin_all" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'customer-documents' AND public.has_permission(auth.uid(), 'manage_customers'))
WITH CHECK (bucket_id = 'customer-documents' AND public.has_permission(auth.uid(), 'manage_customers'));

-- epl-documents
CREATE POLICY "epl_docs_owner_select" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'epl-documents' AND auth.uid()::text = (storage.foldername(name))[2]);
CREATE POLICY "epl_docs_owner_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'epl-documents' AND auth.uid()::text = (storage.foldername(name))[2]);
CREATE POLICY "epl_docs_owner_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'epl-documents' AND auth.uid()::text = (storage.foldername(name))[2]);
CREATE POLICY "epl_docs_owner_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'epl-documents' AND auth.uid()::text = (storage.foldername(name))[2]);
CREATE POLICY "epl_docs_admin_all" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'epl-documents' AND public.has_permission(auth.uid(), 'manage_customers'))
WITH CHECK (bucket_id = 'epl-documents' AND public.has_permission(auth.uid(), 'manage_customers'));

-- vehicle-media: public read (anon + authenticated), write by manage_vehicles
CREATE POLICY "vehicle_media_public_select" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'vehicle-media');
CREATE POLICY "vehicle_media_admin_write" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'vehicle-media' AND public.has_permission(auth.uid(), 'manage_vehicles'))
WITH CHECK (bucket_id = 'vehicle-media' AND public.has_permission(auth.uid(), 'manage_vehicles'));

-- site-media: public read, write by manage_site_content
CREATE POLICY "site_media_public_select" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'site-media');
CREATE POLICY "site_media_admin_write" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'site-media' AND public.has_permission(auth.uid(), 'manage_site_content'))
WITH CHECK (bucket_id = 'site-media' AND public.has_permission(auth.uid(), 'manage_site_content'));

-- Bootstrap Owner: assign owner role to aclash26@gmail.com if user exists
DO $$
DECLARE
  v_user_id uuid;
  v_role_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower('aclash26@gmail.com') LIMIT 1;
  SELECT id INTO v_role_id FROM public.roles WHERE slug = 'owner' LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Owner user aclash26@gmail.com not found yet — sign up first then re-run bootstrap.';
  ELSIF v_role_id IS NULL THEN
    RAISE NOTICE 'Owner role missing — RBAC migration not applied.';
  ELSE
    INSERT INTO public.profiles (id, full_name, phone, terms_accepted, terms_accepted_at, is_active)
    VALUES (v_user_id, 'Owner', '', true, now(), true)
    ON CONFLICT (id) DO UPDATE SET is_active = true;
    INSERT INTO public.admin_role_assignments (user_id, role_id, assigned_by, is_active)
    VALUES (v_user_id, v_role_id, v_user_id, true)
    ON CONFLICT (user_id, role_id) DO UPDATE SET is_active = true;
    RAISE NOTICE 'Owner role assigned to %', v_user_id;
  END IF;
END $$;
