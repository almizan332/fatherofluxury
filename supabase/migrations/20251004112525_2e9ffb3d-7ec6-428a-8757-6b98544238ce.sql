-- Add seller column to products table
ALTER TABLE public.products 
ADD COLUMN seller text;