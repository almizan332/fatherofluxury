-- Create or update admin user with the requested credentials
-- First, we need to insert into auth.users if it doesn't exist, but since we can't directly access auth.users,
-- we'll create a trigger to handle admin user creation when they sign up

-- Insert admin user into admin_users table (this will reference the auth user)
-- We'll handle the auth user creation through the application code

-- Create a function to check admin status
CREATE OR REPLACE FUNCTION check_admin_access(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user exists in admin_users table or is the specific admin email
  RETURN EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.user_id IN (
      SELECT id FROM auth.users WHERE email = user_email
    )
  ) OR user_email = 'almizancolab@gmail.com';
END;
$$;

-- Create a function to ensure admin user exists in admin_users table
CREATE OR REPLACE FUNCTION ensure_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;