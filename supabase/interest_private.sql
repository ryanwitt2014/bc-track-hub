-- BC Track Hub: keep interest-form answers coach-only.
-- Paste into Supabase > SQL Editor and click Run. Safe to run again.
-- Everything else in the hub stays public to read, same as before.
drop policy if exists "Anyone can read the hub" on public.hub_data;
create policy "Anyone can read the hub" on public.hub_data for select
  using (key not in ('midnotes', 'interest') or public.is_coach());
