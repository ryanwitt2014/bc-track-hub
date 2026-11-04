-- BC Track Hub · Scouting (Competitive Intelligence) · migration 001
-- Adds four coach-only tables for opponent results. Nothing existing is changed.
-- Paste into Supabase > SQL Editor and click Run. Safe to run again.

-- Schools, with other spellings so "Twin Lakes" and "Roosevelt (Twin Lakes)" are one school
create table if not exists public.schools (
  id          bigint generated always as identity primary key,
  name        text not null,
  short       text,
  conference  text,
  aliases     text[] not null default '{}',
  created_at  timestamptz not null default now()
);
create unique index if not exists schools_name_key on public.schools (lower(name));

-- One row per meet (per level). Results carry their own gender.
create table if not exists public.meets (
  id          bigint generated always as identity primary key,
  name        text not null,
  meet_date   date,
  season      int,
  level       text not null default 'HS' check (level in ('HS','JH')),
  meet_type   text check (meet_type in ('dual','tri','quad','invite','conference','sectional','regional','state','other')),
  host        text,
  source_url  text,
  source_note text,
  scoring     jsonb,          -- {"ind":[10,8,6,5,4,3,2,1],"relay":[10,8,6,4,2], "inferred":true, "basis":"..."}
  notes       text,
  created_at  timestamptz not null default now(),
  created_by  text
);
create unique index if not exists meets_key on public.meets (lower(name), coalesce(meet_date, '1900-01-01'::date), level);

-- Batches: every import is recorded (where it came from, how many rows were new vs duplicates)
create table if not exists public.import_batches (
  id          bigint generated always as identity primary key,
  meet_id     bigint references public.meets(id) on delete set null,
  source      text,
  filename    text,
  rows_in     int not null default 0,
  inserted    int not null default 0,
  duplicates  int not null default 0,
  errors      int not null default 0,
  created_by  text,
  created_at  timestamptz not null default now()
);

-- Individual results. dedupe_key blocks the same row being imported twice.
create table if not exists public.results (
  id              bigint generated always as identity primary key,
  meet_id         bigint not null references public.meets(id) on delete cascade,
  batch_id        bigint references public.import_batches(id) on delete set null,
  event           text not null,                 -- Hub event codes: 100, 200, 400, 800, 1600, 3200, 100H, 110H, 300H, LJ, HJ, PV, SP, DT, 4x100, 4x400, 4x800
  gender          text not null check (gender in ('B','G')),
  round           text not null default 'F',     -- F final, P prelim, H heat
  place           int,
  athlete         text,                          -- relay: team letter or leg names
  school_id       bigint references public.schools(id) on delete set null,
  grade           int,
  mark            text,                          -- as printed
  mark_value      numeric,                       -- seconds for races, inches for field events; null for DNF/DQ/NH
  status          text,                          -- DNF, DNS, DQ, NH, FS, SCR
  points          numeric,                       -- team points if the results list them
  relay           boolean not null default false,
  bc_athlete_id   text,                          -- link to the Hub roster for Benton Central kids
  source_row      jsonb,                         -- the original imported row, kept forever
  dedupe_key      text not null,
  corrected_by    text,
  corrected_at    timestamptz,
  correction_note text,
  created_at      timestamptz not null default now()
);
create unique index if not exists results_dedupe_key on public.results (dedupe_key);
create index if not exists results_meet_idx   on public.results (meet_id);
create index if not exists results_event_idx  on public.results (event, gender);
create index if not exists results_school_idx on public.results (school_id);

-- Coach-only: signed-in coaches on the coaches list can read and write. Nobody else can see these tables.
alter table public.schools        enable row level security;
alter table public.meets          enable row level security;
alter table public.import_batches enable row level security;
alter table public.results        enable row level security;

do $$
declare t text;
begin
  foreach t in array array['schools','meets','import_batches','results'] loop
    execute format('drop policy if exists "Coaches read %1$s"   on public.%1$I', t);
    execute format('drop policy if exists "Coaches add %1$s"    on public.%1$I', t);
    execute format('drop policy if exists "Coaches change %1$s" on public.%1$I', t);
    execute format('drop policy if exists "Coaches remove %1$s" on public.%1$I', t);
    execute format('create policy "Coaches read %1$s"   on public.%1$I for select to authenticated using (public.is_coach())', t);
    execute format('create policy "Coaches add %1$s"    on public.%1$I for insert to authenticated with check (public.is_coach())', t);
    execute format('create policy "Coaches change %1$s" on public.%1$I for update to authenticated using (public.is_coach()) with check (public.is_coach())', t);
    execute format('create policy "Coaches remove %1$s" on public.%1$I for delete to authenticated using (public.is_coach())', t);
  end loop;
end $$;

-- Benton Central is always school #1 in practice; make sure it exists.
insert into public.schools (name, short, conference, aliases)
values ('Benton Central', 'BC', 'Hoosier', array['Benton Central HS','Benton Central High School','BCHS'])
on conflict do nothing;

-- Table access for signed-in users (the coach-only rules above still decide what they can see). No access for anonymous visitors.
grant select, insert, update, delete on public.schools, public.meets, public.import_batches, public.results to authenticated;
revoke all on public.schools, public.meets, public.import_batches, public.results from anon;
