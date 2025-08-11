-- Create admin_2fa_settings table for storing 2FA preferences
CREATE TABLE public.admin_2fa_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  preferred_method TEXT NOT NULL DEFAULT 'email' CHECK (preferred_method IN ('email', 'sms')),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create verification_codes table for storing temporary codes
CREATE TABLE public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('email', 'sms')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create login_attempts table for IP blocking
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  admin_email TEXT NOT NULL,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('password', '2fa')),
  success BOOLEAN NOT NULL DEFAULT false,
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.admin_2fa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies - only accessible via edge functions/admin
CREATE POLICY "Admin access only" ON public.admin_2fa_settings FOR ALL USING (false);
CREATE POLICY "Admin access only" ON public.verification_codes FOR ALL USING (false);
CREATE POLICY "Admin access only" ON public.login_attempts FOR ALL USING (false);

-- Insert default 2FA settings for the admin
INSERT INTO public.admin_2fa_settings (admin_email, preferred_method)
VALUES ('almizancolab@gmail.com', 'email')
ON CONFLICT (admin_email) DO NOTHING;

-- Add cleanup function for expired codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.verification_codes 
  WHERE expires_at < now() OR used = true;
END;
$$;

-- Add trigger for updated_at on admin_2fa_settings
CREATE TRIGGER update_admin_2fa_settings_updated_at
  BEFORE UPDATE ON public.admin_2fa_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();