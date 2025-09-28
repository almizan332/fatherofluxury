-- Allow public read access to products for the homepage
CREATE POLICY "Allow public read access to products"
ON public.products
FOR SELECT
TO PUBLIC
USING (true);

-- Update the existing admin read policy to be more specific
DROP POLICY IF EXISTS "admin read products" ON public.products;

-- Keep admin full access for management operations
CREATE POLICY "Admin full access to products"
ON public.products
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());