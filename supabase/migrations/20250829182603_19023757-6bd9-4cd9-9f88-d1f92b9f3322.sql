-- Create admin user seed (run this after creating the user manually in Supabase Auth)
-- This creates the default admin user with email almizancolab@gmail.com
-- First create the user in Supabase Auth Dashboard with email: almizancolab@gmail.com and password

-- Insert the admin profile (this will be triggered by the handle_new_user trigger when the user is created)
-- But we also add a manual insert with ON CONFLICT to ensure admin role
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'almizancolab@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET role = 'admin', email = EXCLUDED.email;

-- Policy to allow admin users to manage profiles
CREATE POLICY "admin can manage all profiles" ON public.profiles
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());