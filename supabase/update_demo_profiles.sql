-- Update Demo User Profiles
-- Run this script in Supabase SQL Editor after creating auth users
-- This ensures the profiles table has the correct roles and test flags

-- Delete existing demo profiles if they exist (cleanup)
DELETE FROM public.profiles 
WHERE user_id IN (
  'cf4ec27e-96c0-4467-a7cd-196b28ded1b7',
  '087255d8-3375-46f3-99c7-239180ab0f21',
  'b622668a-7975-4d33-9c0f-80d7701c29e5'
);

-- Insert/Update Admin demo user (tester role)
INSERT INTO public.profiles (user_id, role, is_test_user, created_at, updated_at)
VALUES (
  'cf4ec27e-96c0-4467-a7cd-196b28ded1b7',
  'tester',
  true,
  now(),
  now()
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'tester',
  is_test_user = true,
  updated_at = now();

-- Insert/Update Accounting demo user (contabilidad role)
INSERT INTO public.profiles (user_id, role, is_test_user, created_at, updated_at)
VALUES (
  '087255d8-3375-46f3-99c7-239180ab0f21',
  'contabilidad',
  true,
  now(),
  now()
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'contabilidad',
  is_test_user = true,
  updated_at = now();

-- Insert/Update Sales demo user (vendedor role)
INSERT INTO public.profiles (user_id, role, is_test_user, created_at, updated_at)
VALUES (
  'b622668a-7975-4d33-9c0f-80d7701c29e5',
  'vendedor',
  true,
  now(),
  now()
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'vendedor',
  is_test_user = true,
  updated_at = now();

-- Verify the profiles were created/updated correctly
SELECT 
  user_id,
  role,
  is_test_user,
  created_at,
  updated_at
FROM public.profiles
WHERE user_id IN (
  'cf4ec27e-96c0-4467-a7cd-196b28ded1b7',
  '087255d8-3375-46f3-99c7-239180ab0f21',
  'b622668a-7975-4d33-9c0f-80d7701c29e5'
)
ORDER BY role;

-- Expected output:
-- user_id                              | role          | is_test_user | created_at | updated_at
-- 087255d8-3375-46f3-99c7-239180ab0f21 | contabilidad  | true         | ...        | ...
-- cf4ec27e-96c0-4467-a7cd-196b28ded1b7 | tester        | true         | ...        | ...
-- b622668a-7975-4d33-9c0f-80d7701c29e5 | vendedor      | true         | ...        | ...
