
CREATE TABLE public.yupoo_passwords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_url TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.yupoo_passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins manage yupoo passwords"
ON public.yupoo_passwords
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE TRIGGER yupoo_passwords_updated_at
BEFORE UPDATE ON public.yupoo_passwords
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
