-- Allow public read access to product images
CREATE POLICY "Allow public read access to product images"
ON public.product_images
FOR SELECT
TO PUBLIC
USING (true);

-- Update admin policies to be more specific
DROP POLICY IF EXISTS "admin read images" ON public.product_images;
DROP POLICY IF EXISTS "admin write images" ON public.product_images;

-- Keep admin full access for management operations
CREATE POLICY "Admin full access to product images"
ON public.product_images
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());