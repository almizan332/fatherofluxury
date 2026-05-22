CREATE OR REPLACE FUNCTION public.hamming_distance_bigint(a bigint, b bigint)
RETURNS integer
LANGUAGE sql
IMMUTABLE
STRICT
SET search_path = public
AS $$
  SELECT length(replace(((a # b)::bit(64))::text, '0', ''))::integer;
$$;

CREATE OR REPLACE FUNCTION public.search_products_by_image_hash(
  _query_hash bigint,
  _limit integer DEFAULT 12
)
RETURNS TABLE (
  id uuid,
  slug text,
  product_name text,
  first_image text,
  distance integer,
  similarity integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ranked.id,
    ranked.slug,
    ranked.product_name,
    ranked.first_image,
    ranked.distance,
    GREATEST(0, LEAST(100, ROUND((1 - ranked.distance / 64.0) * 100)::integer)) AS similarity
  FROM (
    SELECT
      p.id,
      p.slug,
      p.product_name,
      p.first_image,
      public.hamming_distance_bigint(_query_hash, p.image_phash) AS distance
    FROM public.products p
    WHERE p.image_phash IS NOT NULL
  ) ranked
  ORDER BY ranked.distance ASC, ranked.id ASC
  LIMIT LEAST(GREATEST(COALESCE(_limit, 12), 1), 50);
$$;

CREATE INDEX IF NOT EXISTS idx_products_image_phash_not_null
ON public.products (image_phash)
WHERE image_phash IS NOT NULL;