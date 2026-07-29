DROP POLICY IF EXISTS "Anyone reads content" ON public.site_content;
REVOKE ALL ON public.site_content FROM anon;

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_user_permissions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.current_user_permissions() TO service_role;