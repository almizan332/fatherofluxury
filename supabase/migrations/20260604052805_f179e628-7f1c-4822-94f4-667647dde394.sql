
-- 1. Storage: tighten category-images, category_images, temp_uploads
DROP POLICY IF EXISTS "Allow public access to category_images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
DROP POLICY IF EXISTS "Public Access for category-images" ON storage.objects;
DROP POLICY IF EXISTS "give_public_access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to temp_uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public Access for temp_uploads" ON storage.objects;

-- Public read for category buckets (kept public so site works)
CREATE POLICY "category_buckets_public_read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id IN ('category-images', 'category_images'));

CREATE POLICY "category_buckets_admin_write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('category-images', 'category_images') AND public.is_admin());

CREATE POLICY "category_buckets_admin_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('category-images', 'category_images') AND public.is_admin())
  WITH CHECK (bucket_id IN ('category-images', 'category_images') AND public.is_admin());

CREATE POLICY "category_buckets_admin_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('category-images', 'category_images') AND public.is_admin());

-- temp_uploads: authenticated upload, public read (so signed URLs/preview work), admin delete
CREATE POLICY "temp_uploads_public_read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'temp_uploads');

CREATE POLICY "temp_uploads_authenticated_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'temp_uploads');

CREATE POLICY "temp_uploads_owner_or_admin_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'temp_uploads' AND (owner = auth.uid() OR public.is_admin()));

CREATE POLICY "temp_uploads_owner_or_admin_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'temp_uploads' AND (owner = auth.uid() OR public.is_admin()))
  WITH CHECK (bucket_id = 'temp_uploads' AND (owner = auth.uid() OR public.is_admin()));

-- 2. Profiles: block role escalation on self-update
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
CREATE POLICY "update own profile"
  ON public.profiles FOR UPDATE TO public
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'user');

-- 3. Reviews: hide user_email from anon/authenticated; only admins see it via existing ALL policy
REVOKE SELECT (user_email) ON public.reviews FROM anon, authenticated;

-- 4. Set search_path on functions missing it
ALTER FUNCTION public.generate_unique_slug(text) SET search_path = public;
ALTER FUNCTION public.update_category_product_counts() SET search_path = public;
ALTER FUNCTION public.trigger_update_category_counts() SET search_path = public;

-- 5. Restrict EXECUTE on internal/trigger-only SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_product_slug() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trigger_update_category_counts() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_codes() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.ensure_admin_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.check_admin_access(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.check_if_admin() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_category_product_counts() FROM anon, authenticated, public;
