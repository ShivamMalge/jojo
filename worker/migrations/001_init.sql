create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  email text not null unique,
  password_hash text not null,
  salt text not null,
  role text not null default 'student',
  level text not null default 'beginner',
  created_at timestamptz not null default now()
);

alter table users add column if not exists username text;
alter table users add column if not exists role text not null default 'student';
alter table users add column if not exists level text not null default 'beginner';
create unique index if not exists users_username_unique on users (lower(username));
create unique index if not exists users_email_unique on users (lower(email));

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists app_settings (
  id integer primary key default 1,
  focus_minutes integer not null default 120 check (focus_minutes between 1 and 240),
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint app_settings_singleton check (id = 1)
);

insert into app_settings (id, focus_minutes)
values (1, 120)
on conflict (id) do nothing;

create table if not exists student_question_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  question_id integer not null,
  question_title text not null,
  question_explanation text not null default '',
  assigned_at timestamptz not null default now(),
  compiled_at timestamptz,
  succeeded_at timestamptz
);

create index if not exists student_question_active_idx
  on student_question_assignments (user_id, compiled_at);

create table if not exists compile_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  assignment_id uuid references student_question_assignments(id) on delete set null,
  question_id integer,
  code text not null,
  stdin text not null default '',
  status_id integer,
  status_description text,
  succeeded boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists code_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  assignment_id uuid references student_question_assignments(id) on delete set null,
  question_id integer,
  code text not null,
  analysis text,
  created_at timestamptz not null default now()
);
