-- BC Track Hub 2.0: athlete check-ins (readiness + session RPE) and private speed profiles.
-- Paste into Supabase > SQL Editor and click Run. Safe to run again.
-- Athletes can SEND a check-in (no login), but only signed-in coaches can READ or delete them.
create table if not exists public.hub_checkins (
  id bigint generated always as identity primary key,
  ath text not null check (char_length(ath) between 1 and 60),
  d date not null default current_date,
  kind text not null check (kind in ('ready','rpe')),
  data jsonb not null check (pg_column_size(data) < 2000),
  created_at timestamptz not null default now()
);
alter table public.hub_checkins enable row level security;
drop policy if exists "Athletes can send check-ins" on public.hub_checkins;
create policy "Athletes can send check-ins" on public.hub_checkins for insert to anon, authenticated
  with check (d between current_date - 2 and current_date + 1);
drop policy if exists "Coaches read check-ins" on public.hub_checkins;
create policy "Coaches read check-ins" on public.hub_checkins for select using (public.is_coach());
drop policy if exists "Coaches delete check-ins" on public.hub_checkins;
create policy "Coaches delete check-ins" on public.hub_checkins for delete using (public.is_coach());
create index if not exists hub_checkins_d on public.hub_checkins (d);
-- Speed profiles join the coach-only keys (interest answers and coach notes were already private).
drop policy if exists "Anyone can read the hub" on public.hub_data;
create policy "Anyone can read the hub" on public.hub_data for select
  using (key not in ('midnotes', 'interest', 'speedprof') or public.is_coach());
select 'hub2 monitoring ready' as status;
