-- ============================================================
-- EXIT EXAM ETHIOPIA — Full Admin Setup & Fix
-- Run this in Supabase → SQL Editor → New Query → Run
-- ============================================================

-- Step 1: Confirm email and fix auth.users metadata
update auth.users
set
  email_confirmed_at = now(),
  confirmed_at = now(),
  raw_user_meta_data = '{"role":"super_admin","full_name":"Iyasu"}'::jsonb,
  raw_app_meta_data  = '{"provider":"email","providers":["email"],"role":"super_admin"}'::jsonb,
  updated_at = now()
where email = 'iyasu4313@gmail.com';

-- Step 2: Insert or update public.users row
insert into public.users (id, email, full_name, role, is_blocked, created_at, updated_at)
select
  id,
  email,
  'Iyasu',
  'super_admin',
  false,
  now(),
  now()
from auth.users
where email = 'iyasu4313@gmail.com'
on conflict (id) do update
  set role       = 'super_admin',
      full_name  = 'Iyasu',
      is_blocked = false,
      updated_at = now();

-- Step 3: Disable email confirmation requirement for all future signups
-- (run this once — removes the need to confirm email before login)
update auth.config
set value = 'false'
where parameter = 'MAILER_AUTOCONFIRM'
  and false; -- safety guard, do manually in Dashboard instead

-- Step 4: Confirm ALL existing unconfirmed users
update auth.users
set
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  confirmed_at       = coalesce(confirmed_at, now())
where email_confirmed_at is null;

-- Step 5: Verify everything is correct
select
  au.id,
  au.email,
  au.email_confirmed_at,
  au.raw_user_meta_data->>'role'     as jwt_role,
  au.raw_app_meta_data->>'role'      as app_role,
  pu.role                             as db_role,
  pu.full_name,
  pu.is_blocked
from auth.users au
left join public.users pu on pu.id = au.id
where au.email = 'iyasu4313@gmail.com';
