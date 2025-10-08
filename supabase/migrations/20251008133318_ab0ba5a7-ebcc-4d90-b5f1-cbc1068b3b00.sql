-- Add slug column to blog_posts table
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug for better performance and uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);

-- Generate slugs for existing posts (using title)
UPDATE blog_posts 
SET slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;