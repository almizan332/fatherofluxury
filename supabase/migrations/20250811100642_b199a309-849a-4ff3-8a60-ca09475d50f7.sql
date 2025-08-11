-- Add phone number and carrier to admin 2FA settings
ALTER TABLE public.admin_2fa_settings 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT;