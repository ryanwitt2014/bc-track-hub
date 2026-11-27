-- BC Track Hub: keep sprint test results coach-only (with interest answers, coach notes and speed profiles).
-- Paste into Supabase > SQL Editor and click Run. Safe to run again.
drop policy if exists "Anyone can read the hub" on public.hub_data;
create policy "Anyone can read the hub" on public.hub_data for select
  using (key not in ('midnotes', 'interest', 'speedprof', 'sprinttest') or public.is_coach());
select 'sprint tests private' as status;
