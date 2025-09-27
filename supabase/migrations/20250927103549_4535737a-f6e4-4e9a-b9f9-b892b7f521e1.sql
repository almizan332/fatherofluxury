-- Fix profile creation and admin access for the user
-- First, ensure the user has a profile
INSERT INTO public.profiles (id, email, role)
VALUES ('a21a6fe3-6c40-4e80-8fe7-5860897cbc06', 'homeincome08@gmail.com', 'admin')
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  email = 'homeincome08@gmail.com';

-- Also add them to admin_users table for extra security
INSERT INTO public.admin_users (user_id, role)
VALUES ('a21a6fe3-6c40-4e80-8fe7-5860897cbc06', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Fix slug generation to avoid duplicates by adding timestamp
CREATE OR REPLACE FUNCTION generate_unique_slug(product_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug
  base_slug := lower(regexp_replace(trim(product_name), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(base_slug, '-');
  
  -- Start with base slug
  final_slug := base_slug;
  
  -- Keep trying until we find a unique slug
  WHILE EXISTS (SELECT 1 FROM products WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;