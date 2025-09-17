-- Fix RLS security issues by enabling RLS and creating appropriate policies

-- Enable RLS on tables that don't have it enabled
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_custom_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_training_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_training_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_training_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yupoo_drafts ENABLE ROW LEVEL SECURITY;

-- Admin Users table - Only admins can manage admin users
CREATE POLICY "Only admins can manage admin users" ON public.admin_users
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Chatbot Custom Prompts - Only admins can manage prompts
CREATE POLICY "Only admins can manage custom prompts" ON public.chatbot_custom_prompts
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Chatbot Settings - Anyone can read, only admins can modify
CREATE POLICY "Anyone can read chatbot settings" ON public.chatbot_settings
FOR SELECT USING (true);

CREATE POLICY "Only admins can modify chatbot settings" ON public.chatbot_settings
FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Only admins can update chatbot settings" ON public.chatbot_settings
FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete chatbot settings" ON public.chatbot_settings
FOR DELETE USING (is_admin());

-- Chatbot Training Content - Only admins can manage training content
CREATE POLICY "Only admins can manage training content" ON public.chatbot_training_content
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Chatbot Training Files - Only admins can manage training files
CREATE POLICY "Only admins can manage training files" ON public.chatbot_training_files
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Chatbot Training URLs - Only admins can manage training URLs
CREATE POLICY "Only admins can manage training URLs" ON public.chatbot_training_urls
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Web Contents - Anyone can read, only admins can modify
CREATE POLICY "Anyone can read web contents" ON public.web_contents
FOR SELECT USING (true);

CREATE POLICY "Only admins can modify web contents" ON public.web_contents
FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Only admins can update web contents" ON public.web_contents
FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete web contents" ON public.web_contents
FOR DELETE USING (is_admin());

-- Yupoo Drafts - Only admins can manage drafts
CREATE POLICY "Only admins can manage yupoo drafts" ON public.yupoo_drafts
FOR ALL USING (is_admin()) WITH CHECK (is_admin());