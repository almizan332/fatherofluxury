-- Fix function search path security warnings by setting search_path for existing functions

-- Update functions to set search_path for security
CREATE OR REPLACE FUNCTION public.cleanup_expired_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.verification_codes 
  WHERE expires_at < now() OR used = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END; 
$function$;

CREATE OR REPLACE FUNCTION public.check_admin_access(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Check if user exists in admin_users table or is the specific admin email
  RETURN EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id IN (
      SELECT id FROM auth.users WHERE email = user_email
    )
  ) OR user_email = 'almizancolab@gmail.com';
END;
$function$;

CREATE OR REPLACE FUNCTION public.ensure_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the admin user ID from auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'almizancolab@gmail.com'
  LIMIT 1;
  
  -- If admin user exists in auth but not in admin_users, add them
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO admin_users (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_if_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF COALESCE(current_setting('app.admin', TRUE)::boolean, FALSE) = FALSE THEN
    RAISE EXCEPTION 'Access denied. User is not an admin.';
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;