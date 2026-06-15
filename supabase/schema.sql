-- ============================================================
-- EXIT EXAM ETHIOPIA — Supabase Schema
-- ============================================================
-- Run this entire file in the Supabase SQL Editor:
--   https://supabase.com → SQL Editor → New Query → Paste → Run
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- ============================================================
-- 1. USERS
-- ============================================================
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  full_name     text not null,
  phone         text,
  university    text,
  student_id    text,
  department_id text,
  avatar_url    text,
  role          text not null default 'student'
                  check (role in ('student', 'admin', 'super_admin')),
  is_blocked    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create user profile on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, phone, university, student_id, department_id, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'university',
    new.raw_user_meta_data->>'student_id',
    new.raw_user_meta_data->>'department_id',
    coalesce(new.raw_user_meta_data->>'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- 2. DEPARTMENTS
-- ============================================================
create table if not exists public.departments (
  id            text primary key,   -- e.g. 'cs', 'nursing'
  name          text not null,
  icon          text not null default '📚',
  category      text not null,
  color         text not null default 'from-violet-500 to-purple-600',
  description   text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Seed all 22 departments
insert into public.departments (id, name, icon, category, color) values
  ('cs',       'Computer Science',           '💻', 'Technology',      'from-violet-500 to-purple-600'),
  ('it',       'Information Technology',     '🖥️', 'Technology',      'from-blue-500 to-cyan-600'),
  ('se',       'Software Engineering',       '⚙️', 'Technology',      'from-indigo-500 to-blue-600'),
  ('is',       'Information Systems',        '📊', 'Technology',      'from-sky-500 to-blue-600'),
  ('cy',       'Cyber Security',             '🔒', 'Technology',      'from-red-500 to-rose-600'),
  ('ds',       'Data Science',               '📈', 'Technology',      'from-emerald-500 to-teal-600'),
  ('nursing',  'Nursing',                    '🏥', 'Health Sciences', 'from-pink-500 to-rose-600'),
  ('midwifery','Midwifery',                  '👶', 'Health Sciences', 'from-pink-400 to-pink-600'),
  ('pharmacy', 'Pharmacy',                   '💊', 'Health Sciences', 'from-green-500 to-emerald-600'),
  ('medicine', 'Medicine',                   '⚕️', 'Health Sciences', 'from-red-400 to-red-600'),
  ('ph',       'Public Health',              '🌍', 'Health Sciences', 'from-teal-500 to-cyan-600'),
  ('af',       'Accounting & Finance',       '💰', 'Business',        'from-yellow-500 to-amber-600'),
  ('econ',     'Economics',                  '📉', 'Business',        'from-orange-500 to-amber-600'),
  ('mgmt',     'Management',                 '📋', 'Business',        'from-blue-500 to-indigo-600'),
  ('mktg',     'Marketing Management',       '📣', 'Business',        'from-purple-500 to-violet-600'),
  ('ba',       'Business Administration',    '🏢', 'Business',        'from-slate-500 to-gray-600'),
  ('civil',    'Civil Engineering',          '🏗️', 'Engineering',     'from-stone-500 to-slate-600'),
  ('mech',     'Mechanical Engineering',     '⚙️', 'Engineering',     'from-zinc-500 to-gray-600'),
  ('elec',     'Electrical Engineering',     '⚡', 'Engineering',     'from-yellow-400 to-yellow-600'),
  ('arch',     'Architecture',               '🏛️', 'Engineering',     'from-amber-500 to-orange-600'),
  ('agri',     'Agriculture',                '🌾', 'Natural Sciences','from-green-400 to-lime-600'),
  ('law',      'Law',                        '⚖️', 'Social Sciences', 'from-slate-600 to-gray-700')
on conflict (id) do nothing;


-- ============================================================
-- 3. EXAMS
-- ============================================================
create table if not exists public.exams (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  department_id    text not null references public.departments(id) on delete cascade,
  description      text,
  duration_minutes integer not null default 180 check (duration_minutes > 0),
  question_count   integer not null default 100 check (question_count > 0),
  passing_score    integer not null default 50 check (passing_score between 1 and 100),
  is_active        boolean not null default true,
  exam_type        text not null default 'practice'
                     check (exam_type in ('practice', 'mock', 'previous')),
  year             integer,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger exams_updated_at
  before update on public.exams
  for each row execute procedure public.set_updated_at();

create index if not exists exams_dept_idx       on public.exams(department_id);
create index if not exists exams_type_idx       on public.exams(exam_type);
create index if not exists exams_active_idx     on public.exams(is_active);


-- ============================================================
-- 4. QUESTIONS
-- ============================================================
create table if not exists public.questions (
  id              uuid primary key default uuid_generate_v4(),
  exam_id         uuid not null references public.exams(id) on delete cascade,
  question_text   text not null,
  question_type   text not null default 'mcq'
                    check (question_type in ('mcq', 'true_false')),
  options         text[],          -- ['Option A', 'Option B', ...]
  correct_answer  integer not null, -- 0-based index into options[]
  explanation     text,
  marks           integer not null default 1 check (marks > 0),
  order_num       integer not null default 1,
  created_at      timestamptz not null default now()
);

create index if not exists questions_exam_idx on public.questions(exam_id);
create index if not exists questions_order_idx on public.questions(exam_id, order_num);


-- ============================================================
-- 5. RESULTS
-- ============================================================
create table if not exists public.results (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  exam_id          uuid not null references public.exams(id) on delete cascade,
  total_questions  integer not null,
  correct_answers  integer not null,
  wrong_answers    integer not null,
  score            integer not null,
  percentage       integer not null check (percentage between 0 and 100),
  passed           boolean not null,
  time_taken       integer not null default 0, -- seconds
  answers          jsonb not null default '{}', -- {question_id: chosen_index}
  completed_at     timestamptz not null default now()
);

create index if not exists results_user_idx  on public.results(user_id);
create index if not exists results_exam_idx  on public.results(exam_id);
create index if not exists results_date_idx  on public.results(completed_at desc);


-- ============================================================
-- 6. CERTIFICATES
-- ============================================================
create table if not exists public.certificates (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references public.users(id) on delete cascade,
  exam_id            uuid not null references public.exams(id) on delete cascade,
  certificate_number text not null unique,
  score              integer not null,
  issued_at          timestamptz not null default now(),
  unique (user_id, exam_id)
);

create index if not exists certs_user_idx on public.certificates(user_id);

-- Auto-generate certificate when a result is inserted with passed = true
create or replace function public.auto_issue_certificate()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.passed = true then
    insert into public.certificates (user_id, exam_id, certificate_number, score)
    values (
      new.user_id,
      new.exam_id,
      'EEE-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(new.id::text) for 8)),
      new.percentage
    )
    on conflict (user_id, exam_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_result_passed on public.results;
create trigger on_result_passed
  after insert on public.results
  for each row execute procedure public.auto_issue_certificate();


-- ============================================================
-- 7. MATERIALS
-- ============================================================
create table if not exists public.materials (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  department_id   text references public.departments(id) on delete set null,
  file_url        text not null,
  file_type       text not null default 'pdf'
                    check (file_type in ('pdf', 'docx', 'ppt', 'xls', 'image', 'other')),
  file_size       bigint not null default 0,  -- bytes
  category        text not null default 'notes'
                    check (category in ('notes', 'books', 'slides', 'past_exam', 'other')),
  download_count  integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists materials_dept_idx on public.materials(department_id);
create index if not exists materials_cat_idx  on public.materials(category);


-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.users(id) on delete cascade,  -- null = all users
  title      text not null,
  message    text not null,
  type       text not null default 'general'
               check (type in ('exam_alert', 'result', 'department', 'general')),
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifs_user_idx on public.notifications(user_id);
create index if not exists notifs_read_idx on public.notifications(is_read);


-- ============================================================
-- 9. ADMINS (tracks admin metadata; auth still via auth.users)
-- ============================================================
create table if not exists public.admins (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null unique,
  full_name  text not null,
  role       text not null default 'admin'
               check (role in ('admin', 'super_admin')),
  created_at timestamptz not null default now()
);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- USERS
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Admins can view all users"
  on public.users for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('admin', 'super_admin')
    )
  );

create policy "Admins can update all users"
  on public.users for update
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('admin', 'super_admin')
    )
  );

create policy "Admins can delete users"
  on public.users for delete
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('admin', 'super_admin')
    )
  );

-- DEPARTMENTS (public read, admin write)
alter table public.departments enable row level security;

create policy "Anyone can view active departments"
  on public.departments for select
  using (is_active = true or
    exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','super_admin'))
  );

create policy "Admins can manage departments"
  on public.departments for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','super_admin'))
  );

-- EXAMS (public read for active, admin write)
alter table public.exams enable row level security;

create policy "Anyone authenticated can view active exams"
  on public.exams for select
  using (is_active = true or
    exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','super_admin'))
  );

create policy "Admins can manage exams"
  on public.exams for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','super_admin'))
  );

-- QUESTIONS (authenticated students can read, admin write)
alter table public.questions enable row level security;

create policy "Authenticated users can read questions"
  on public.questions for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage questions"
  on public.questions for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','super_admin'))
  );

-- RESULTS (own only, admin all)
alter table public.results enable row level security;

create policy "Users can view their own results"
  on public.results for select
  using (auth.uid() = user_id);

create policy "Users can insert their own results"
  on public.results for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all results"
  on public.results for select
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','super_admin'))
  );

-- CERTIFICATES
alter table public.certificates enable row level security;

create policy "Users can view their own certificates"
  on public.certificates for select
  using (auth.uid() = user_id);

create policy "Admins can manage certificates"
  on public.certificates for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','super_admin'))
  );

-- MATERIALS (authenticated read, admin write)
alter table public.materials enable row level security;

create policy "Authenticated users can view materials"
  on public.materials for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage materials"
  on public.materials for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','super_admin'))
  );

-- NOTIFICATIONS
alter table public.notifications enable row level security;

create policy "Users can view their own or broadcast notifications"
  on public.notifications for select
  using (user_id = auth.uid() or user_id is null);

create policy "Users can mark their notifications as read"
  on public.notifications for update
  using (user_id = auth.uid() or user_id is null);

create policy "Admins can manage notifications"
  on public.notifications for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','super_admin'))
  );

-- ADMINS
alter table public.admins enable row level security;

create policy "Super admins can manage admins"
  on public.admins for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'super_admin')
  );


-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run these in Supabase Dashboard → Storage → New Bucket,
-- OR uncomment below if using supabase CLI:

-- insert into storage.buckets (id, name, public) values
--   ('avatars',   'avatars',   true),
--   ('materials', 'materials', true),
--   ('results',   'results',   false)
-- on conflict (id) do nothing;

-- Storage policies (avatars — public read, owner write)
-- create policy "Public avatar read"  on storage.objects for select using (bucket_id = 'avatars');
-- create policy "Owner avatar upload" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "Owner avatar update" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);


-- ============================================================
-- HELPER: create first super-admin
-- ============================================================
-- After signing up via the app, run this to promote yourself:
--
--   update public.users
--   set role = 'super_admin'
--   where email = 'your@email.com';
--
-- Then update auth.users metadata too (so JWT includes the role):
--
--   update auth.users
--   set raw_user_meta_data = raw_user_meta_data || '{"role":"super_admin"}'
--   where email = 'your@email.com';

-- ============================================================
-- END OF SCHEMA
-- ============================================================
