-- Ensure all public-facing content is publicly readable

-- Categories: Public read access (already exists, but ensuring it's correct)
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Public read access to categories"
ON public.categories
FOR SELECT
TO PUBLIC
USING (true);

-- Blog posts: Public read access (updating to be more permissive)
DROP POLICY IF EXISTS "Authenticated users can view blog posts" ON public.blog_posts;
CREATE POLICY "Public read access to blog posts"
ON public.blog_posts
FOR SELECT
TO PUBLIC
USING (true);

-- Web contents: Keep public read access (already correct)
-- Products: Already has public read access (fixed earlier)
-- Product images: Already has public read access (fixed earlier)

-- Admin-only policies remain unchanged for management operations:
-- - Products: Admin full access for INSERT, UPDATE, DELETE
-- - Categories: Admin full access for INSERT, UPDATE, DELETE  
-- - Blog posts: Admin full access for INSERT, UPDATE, DELETE
-- - Product images: Admin full access for INSERT, UPDATE, DELETE