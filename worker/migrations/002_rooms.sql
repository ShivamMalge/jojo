create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  name text not null,
  manager_id uuid not null references users(id) on delete cascade,
  max_capacity integer not null default 100 check (max_capacity between 1 and 100),
  created_at timestamptz not null default now()
);

create unique index if not exists rooms_code_unique on rooms(lower(room_code));

create table if not exists room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  finished_count integer not null default 0,
  unique(room_id, user_id)
);

create index if not exists room_members_room_idx on room_members(room_id);
create index if not exists room_members_user_idx on room_members(user_id);

alter table student_question_assignments add column if not exists submitted_at timestamptz;
