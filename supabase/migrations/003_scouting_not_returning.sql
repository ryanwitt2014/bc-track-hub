-- BC Track Hub · Scouting · migration 003
-- Coach adjustments for 2027 projections. Coaches only.
--   status 'gone'  = an opponent athlete who isn't returning (transferred, quit, injured...)
--   status 'relay' = an opponent relay changed by the coach: adj_mark = new projected time, or empty = drop it
-- Paste into Supabase > SQL Editor and click Run. Safe to run again.
create table if not exists public.athlete_flags (
  id           bigint generated always as identity primary key,
  school_id    bigint not null references public.schools(id) on delete cascade,
  athlete      text not null,
  athlete_key  text not null,               -- lowercased name, letters/numbers only
  status       text not null default 'gone',
  adj_mark     text,
  note         text,
  created_by   text,
  created_at   timestamptz not null default now(),
  unique (school_id, athlete_key)
);
alter table public.athlete_flags add column if not exists adj_mark text;
alter table public.athlete_flags enable row level security;
drop policy if exists "Coaches read athlete_flags"   on public.athlete_flags;
drop policy if exists "Coaches add athlete_flags"    on public.athlete_flags;
drop policy if exists "Coaches change athlete_flags" on public.athlete_flags;
drop policy if exists "Coaches remove athlete_flags" on public.athlete_flags;
create policy "Coaches read athlete_flags"   on public.athlete_flags for select to authenticated using (public.is_coach());
create policy "Coaches add athlete_flags"    on public.athlete_flags for insert to authenticated with check (public.is_coach());
create policy "Coaches change athlete_flags" on public.athlete_flags for update to authenticated using (public.is_coach()) with check (public.is_coach());
create policy "Coaches remove athlete_flags" on public.athlete_flags for delete to authenticated using (public.is_coach());
grant select, insert, update, delete on public.athlete_flags to authenticated;
revoke all on public.athlete_flags from anon;

-- Starting list: Hamilton Heights' Higgins sisters aren't returning (Lilly/Lillian is one athlete listed two ways)
insert into public.athlete_flags (school_id, athlete, athlete_key, note, created_by)
select s.id, x.a, x.k, 'Not returning (per Coach Witt)', 'coach'
from public.schools s, (values ('Lilly Higgins','lilly higgins'), ('Lillian Higgins','lillian higgins'), ('Maddy Higgins','maddy higgins')) as x(a,k)
where lower(s.name) = 'hamilton heights'
on conflict (school_id, athlete_key) do nothing;
