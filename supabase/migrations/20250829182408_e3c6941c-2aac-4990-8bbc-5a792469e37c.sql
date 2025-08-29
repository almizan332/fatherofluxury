-- Fix RLS issues: Enable RLS on all public tables that don't have it
ALTER TABLE IF EXISTS public.chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chatbot_custom_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chatbot_training_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chatbot_training_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chatbot_training_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.web_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.yupoo_drafts ENABLE ROW LEVEL SECURITY;

-- Fix search path for functions
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;