-- Add perceptual hash column to products for reverse image search
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_phash bigint;

CREATE INDEX IF NOT EXISTS idx_products_image_phash ON public.products(image_phash) WHERE image_phash IS NOT NULL;
