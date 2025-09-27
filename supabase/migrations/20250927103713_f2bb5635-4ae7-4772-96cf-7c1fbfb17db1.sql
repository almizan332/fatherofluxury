-- Add trigger to auto-generate unique slugs
CREATE OR REPLACE FUNCTION public.set_product_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_unique_slug(NEW.product_name);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for products table
DROP TRIGGER IF EXISTS products_set_slug_trigger ON public.products;
CREATE TRIGGER products_set_slug_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION public.set_product_slug();