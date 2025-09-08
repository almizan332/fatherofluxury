-- Add new columns to existing products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS product_name text,
ADD COLUMN IF NOT EXISTS flylink text,
ADD COLUMN IF NOT EXISTS alibaba_url text,
ADD COLUMN IF NOT EXISTS dhgate_url text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS first_image text,
ADD COLUMN IF NOT EXISTS media_links text[];

-- Update existing products to populate product_name from title if needed
UPDATE public.products 
SET product_name = title 
WHERE product_name IS NULL AND title IS NOT NULL;

-- Update existing products to populate first_image from thumbnail if needed  
UPDATE public.products 
SET first_image = thumbnail 
WHERE first_image IS NULL AND thumbnail IS NOT NULL;

-- Set default category for existing products
UPDATE public.products 
SET category = 'General' 
WHERE category IS NULL;