-- ============================================================
-- Resume Builder — Full Schema
-- Run once in the Supabase SQL editor
-- ============================================================


-- ============================================================
-- 1. profiles
-- ============================================================
create table public.profiles (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  username   text        not null unique,
  created_at timestamptz not null default now(),

  constraint username_format check (username ~ '^[a-z0-9_-]{3,30}$')
);

alter table public.profiles enable row level security;

-- anyone can look up a profile (needed for /<username> public route)
create policy "profiles: public read"
  on public.profiles for select
  using (true);

-- only the owner can create their own profile row
create policy "profiles: owner insert"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- only the owner can update their own profile row
create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = user_id);


-- ============================================================
-- 2. resumes
-- ============================================================
create table public.resumes (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null unique references auth.users(id) on delete cascade,
  content    jsonb       not null default '{
    "basics": {
      "name":    "",
      "email":   "",
      "summary": ""
    }
  }',
  structure  jsonb       not null default '{
    "sections": [
      {"key": "basics",       "visible": true},
      {"key": "work",         "visible": true},
      {"key": "education",    "visible": true},
      {"key": "skills",       "visible": true},
      {"key": "projects",     "visible": false},
      {"key": "volunteer",    "visible": false},
      {"key": "awards",       "visible": false},
      {"key": "certificates", "visible": false},
      {"key": "publications", "visible": false},
      {"key": "languages",    "visible": false},
      {"key": "interests",    "visible": false},
      {"key": "references",   "visible": false}
    ],
    "layout": {"columns": 1}
  }',
  updated_at timestamptz not null default now()
);

alter table public.resumes enable row level security;

-- anyone can view any resume (public profile pages)
create policy "resumes: public read"
  on public.resumes for select
  using (true);

-- only the owner can create their resume row
create policy "resumes: owner insert"
  on public.resumes for insert
  with check (auth.uid() = user_id);

-- only the owner can update their resume
create policy "resumes: owner update"
  on public.resumes for update
  using (auth.uid() = user_id);


-- ============================================================
-- 3. Auto-update updated_at on resume save
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger resumes_set_updated_at
  before update on public.resumes
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- 4. Auto-create a blank resume row when a user signs up
--    (security definer so it can insert without a session)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql
security definer set search_path = public as $$
begin
  insert into public.resumes (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
