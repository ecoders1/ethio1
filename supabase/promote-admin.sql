-- ============================================================
-- Promote iyasu4313@gmail.com to super_admin
-- Run this in Supabase → SQL Editor → New Query
-- ============================================================

-- Step 1: Update the public.users table role
update public.users
set
  role = 'super_admin',
  updated_at = now()
where email = 'iyasu4313@gmail.com';

-- Step 2: Update auth.users metadata so the JWT contains the role
-- (required so the admin login check in the app works correctly)
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role":"super_admin","full_name":"Iyasu"}'::jsonb
where email = 'iyasu4313@gmail.com';

-- Step 3: Verify the update was successful
select
  u.id,
  u.email,
  u.role,
  u.full_name,
  au.raw_user_meta_data->>'role' as jwt_role,
  u.created_at
from public.users u
join auth.users au on au.id = u.id
where u.email = 'iyasu4313@gmail.com';
