-- Update handle_new_user trigger to create personal accounts with tester role
-- Run this in Supabase SQL Editor

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated function that sets role='tester' and is_test_user=false
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles(user_id, full_name, role, is_test_user)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'tester', false);
  RETURN NEW;
END; $$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the function
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';
