
-- Set search_path on functions missing it
ALTER FUNCTION public.generate_case_code() SET search_path = public;
ALTER FUNCTION public.generate_tracking_code() SET search_path = public;
ALTER FUNCTION public.tg_block_mutation() SET search_path = public;

-- Revoke EXECUTE from anon/public on internal helpers (keep authenticated + service_role)
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'public.is_owner(uuid)',
    'public.is_admin(uuid)',
    'public.is_active_admin(uuid)',
    'public.has_permission(uuid, text)',
    'public.current_user_permissions()',
    'public.customer_id_for(uuid)',
    'public.audit_write(text, text, uuid, jsonb)',
    'public.generate_case_code()',
    'public.generate_tracking_code()'
  ]
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', fn);
  END LOOP;
END $$;
