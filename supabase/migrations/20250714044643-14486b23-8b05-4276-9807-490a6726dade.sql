-- Add image_search_enabled column to chatbot_settings table
ALTER TABLE public.chatbot_settings 
ADD COLUMN IF NOT EXISTS image_search_enabled BOOLEAN DEFAULT true;