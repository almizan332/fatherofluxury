-- Clean up conflicting RLS policies on categories table
-- Drop all existing policies first
DROP POLICY IF EXISTS "Allow public delete access to categories" ON categories;
DROP POLICY IF EXISTS "Allow public insert access to categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
DROP POLICY IF EXISTS "Allow public update access to categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Enable admin delete" ON categories;
DROP POLICY IF EXISTS "Enable admin insert" ON categories;
DROP POLICY IF EXISTS "Enable admin update" ON categories;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON categories;
DROP POLICY IF EXISTS "Only authenticated users can delete categories" ON categories;
DROP POLICY IF EXISTS "Only authenticated users can insert categories" ON categories;
DROP POLICY IF EXISTS "Only authenticated users can update categories" ON categories;

-- Create new clean policies
-- Everyone can read categories (public access for viewing)
CREATE POLICY "Anyone can view categories" 
ON categories 
FOR SELECT 
TO public
USING (true);

-- Only admins can create categories
CREATE POLICY "Only admins can create categories" 
ON categories 
FOR INSERT 
TO authenticated
WITH CHECK (is_admin());

-- Only admins can update categories  
CREATE POLICY "Only admins can update categories" 
ON categories 
FOR UPDATE 
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete categories
CREATE POLICY "Only admins can delete categories" 
ON categories 
FOR DELETE 
TO authenticated
USING (is_admin());