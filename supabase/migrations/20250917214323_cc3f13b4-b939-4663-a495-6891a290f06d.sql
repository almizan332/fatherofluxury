-- Fix the remaining RLS security issue with blog_posts table
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;