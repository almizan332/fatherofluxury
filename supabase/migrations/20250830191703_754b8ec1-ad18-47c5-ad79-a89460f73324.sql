-- Create robust CSV bulk import product schema

-- Drop existing foreign key constraints if they exist
DROP TABLE IF EXISTS public.product_images CASCADE;

-- Update products table schema for bulk import
DROP TABLE IF EXISTS public.products CASCADE;

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  affiliate_link text,
  thumbnail text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_images table for multiple images per product  
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_images_position ON public.product_images(product_id, position);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Create admin-only RLS policies
DROP POLICY IF EXISTS "admin read products" ON public.products;
DROP POLICY IF EXISTS "admin write products" ON public.products;
DROP POLICY IF EXISTS "admin read images" ON public.product_images;
DROP POLICY IF EXISTS "admin write images" ON public.product_images;

CREATE POLICY "admin read products" ON public.products
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admin write products" ON public.products
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "admin read images" ON public.product_images
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admin write images" ON public.product_images
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Create updated_at trigger
DROP TRIGGER IF EXISTS trg_products_updated ON public.products;

CREATE OR REPLACE FUNCTION public.set_updated_at() 
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END; 
$$;

CREATE TRIGGER trg_products_updated 
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();