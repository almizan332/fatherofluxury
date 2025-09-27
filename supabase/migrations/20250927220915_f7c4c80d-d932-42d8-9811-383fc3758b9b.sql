-- Drop existing conflicting policies first
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "admin write products" ON products;
DROP POLICY IF EXISTS "Admin full access to products" ON products;

-- Create a simple, clear public read policy
CREATE POLICY "Public can read all products" 
ON products 
FOR SELECT 
TO public
USING (true);

-- Create admin policies
CREATE POLICY "Admins can do everything with products" 
ON products 
FOR ALL 
TO authenticated
USING (is_admin()) 
WITH CHECK (is_admin());