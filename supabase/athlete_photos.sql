-- BC Track Hub: athlete photos (school pictures). Paste into Supabase > SQL Editor and click Run. Safe to run again.
-- Creates a "photos" storage folder. Anyone can view the pictures; only signed-in coaches can upload, change, or delete them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 2097152, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg'];

drop policy if exists "Coaches see photos"     on storage.objects;
drop policy if exists "Coaches add photos"     on storage.objects;
drop policy if exists "Coaches change photos"  on storage.objects;
drop policy if exists "Coaches remove photos"  on storage.objects;
create policy "Coaches see photos"    on storage.objects for select to authenticated using (bucket_id = 'photos' and public.is_coach());
create policy "Coaches add photos"    on storage.objects for insert to authenticated with check (bucket_id = 'photos' and public.is_coach());
create policy "Coaches change photos" on storage.objects for update to authenticated using (bucket_id = 'photos' and public.is_coach()) with check (bucket_id = 'photos' and public.is_coach());
create policy "Coaches remove photos" on storage.objects for delete to authenticated using (bucket_id = 'photos' and public.is_coach());
