-- BC Track Hub: spring break (Mar 22–26, 2027) is student independent for HS and JH Distance + Mid Distance.
-- Paste into Supabase > SQL Editor and click Run. Safe to run again.
-- Marks Mon–Fri of that week "Spring break · on your own" for HS and JH, adds a note on Monday,
-- and removes the JH "join the HS group" invite (no team practice). Workouts, meets, and other groups are not touched.
do $do$
declare
  patches jsonb := $plan$[{"start":"2027-03-22","day":"Mon","lv":"HS","sess":{"kind":"spring","title":"Easy","obj":"Spring break: student independent","wk":"Spring break","cls":"Spring break · no team practice"},"groups":{"Distance":[{"t":"Spring break (Mar 22–26): on your own, no team practice. Everything this week is optional and student independent. HSR Finals qualifiers race Saturday, so keep it light.","lv":"HS"},{"t":"30 min Easy + 4 × 80m relaxed strides","lv":"HS"}],"Mid Distance":[{"t":"Spring break (Mar 22–26): on your own, no team practice. Everything this week is optional and student independent. HSR Finals qualifiers race Saturday, so keep it light.","lv":"HS"},{"t":"B1 Easy run: 15–25 min Easy (400-focused runners: 10–15 min, optional)","lv":"HS"},{"t":"4 × 80m relaxed strides","lv":"HS"}]}},{"start":"2027-03-22","day":"Tue","lv":"HS","sess":{"kind":"spring","title":"800 pace","obj":"Spring break: student independent","wk":"Spring break","cls":"Spring break · no team practice"},"groups":{}},{"start":"2027-03-22","day":"Wed","lv":"HS","sess":{"kind":"spring","title":"Easy","obj":"Spring break: student independent","wk":"Spring break","cls":"Spring break · no team practice"},"groups":{}},{"start":"2027-03-22","day":"Thu","lv":"HS","sess":{"kind":"spring","title":"Easy","obj":"Spring break: student independent","wk":"Spring break","cls":"Spring break · no team practice"},"groups":{}},{"start":"2027-03-22","day":"Fri","lv":"HS","sess":{"kind":"spring","title":"Rest","obj":"Spring break: student independent","wk":"Spring break","cls":"Spring break · no team practice"},"groups":{}},{"start":"2027-03-22","day":"Mon","lv":"JH","sess":{"kind":"spring","title":"Easy run","obj":"Spring break: student independent","wk":"JH season week 6","cls":"Spring break · no team practice"},"groups":{"Distance":[{"t":"Spring break (Mar 22–26): on your own, no team practice. Everything this week is optional and student independent.","lv":"JH"},{"t":"[A] 25–40 min Easy","lv":"JH"},{"t":"[B] 20–30 min Easy","lv":"JH"},{"t":"[C] 15–20 min Easy","lv":"JH"}],"Mid Distance":[{"t":"Spring break (Mar 22–26): on your own, no team practice. Everything this week is optional and student independent.","lv":"JH"},{"t":"[A] 25–40 min Easy","lv":"JH"},{"t":"[B] 20–30 min Easy","lv":"JH"},{"t":"[C] 15–20 min Easy","lv":"JH"}]}},{"start":"2027-03-22","day":"Tue","lv":"JH","sess":{"kind":"spring","title":"Controlled aerobic","obj":"Spring break: student independent","wk":"JH season week 6","cls":"Spring break · no team practice"},"groups":{"Distance":[{"t":"Warm-up: 10–15 min Easy + drills (shorter for younger runners).","lv":"JH"},{"t":"2 × 4 min controlled aerobic at Steady effort, 90 sec jog, or a 20–25 min easy run","lv":"JH"},{"t":"Cool-down: 5–10 min Easy.","lv":"JH"}],"Mid Distance":[{"t":"Warm-up: 10–15 min Easy + drills (shorter for younger runners).","lv":"JH"},{"t":"2 × 4 min controlled aerobic at Steady effort, 90 sec jog, or a 20–25 min easy run","lv":"JH"},{"t":"Cool-down: 5–10 min Easy.","lv":"JH"}]}},{"start":"2027-03-22","day":"Wed","lv":"JH","sess":{"kind":"spring","title":"Recovery run or rest","obj":"Spring break: student independent","wk":"JH season week 6","cls":"Spring break · no team practice"},"groups":{}},{"start":"2027-03-22","day":"Thu","lv":"JH","sess":{"kind":"spring","title":"Speed / event focus","obj":"Spring break: student independent","wk":"JH season week 6","cls":"Spring break · no team practice"},"groups":{}},{"start":"2027-03-22","day":"Fri","lv":"JH","sess":{"kind":"spring","title":"Easy run or rest","obj":"Spring break: student independent","wk":"JH season week 6","cls":"Spring break · no team practice"},"groups":{}}]$plan$::jsonb;
  cur jsonb; p jsonb; dd jsonb; keep jsonb; lv text; g text; grp jsonb;
  fw int; fd int; n int := 0;
begin
  select value into cur from public.hub_data where key = 'workouts' for update;
  if cur is null or jsonb_typeof(cur) <> 'array' then raise exception 'No posted workouts found.'; end if;
  for p in select * from jsonb_array_elements(patches) loop
    lv := p ->> 'lv'; fw := null; fd := null;
    for i in 0 .. jsonb_array_length(cur) - 1 loop
      if cur -> i ->> 'start' = p ->> 'start' then fw := i; end if;
    end loop;
    if fw is not null then
      for j in 0 .. jsonb_array_length(coalesce(cur -> fw -> 'days', '[]'::jsonb)) - 1 loop
        if cur -> fw -> 'days' -> j ->> 'day' = p ->> 'day' then fd := j; end if;
      end loop;
    end if;
    if fd is null then raise notice 'Skipped % % (%): not posted', p ->> 'start', p ->> 'day', lv; continue; end if;
    dd := cur -> fw -> 'days' -> fd;
    for g, grp in select * from jsonb_each(p -> 'groups') loop
      select coalesce(jsonb_agg(x), '[]'::jsonb) into keep
        from jsonb_array_elements(coalesce(dd -> 'groups' -> g, '[]'::jsonb)) x
        where coalesce(x ->> 'lv', '') <> lv;
      dd := jsonb_set(dd, array['groups', g], keep || grp);
    end loop;
    dd := jsonb_set(dd, '{sess}', coalesce(nullif(dd -> 'sess', 'null'::jsonb), '{}'::jsonb) || jsonb_build_object(lv, p -> 'sess'));
    cur := jsonb_set(cur, array[fw::text, 'days', fd::text], dd);
    n := n + 1;
  end loop;
  insert into public.hub_data (key, value, updated_at) values ('workouts', cur, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
  raise notice 'Spring break posted: % of % days updated.', n, jsonb_array_length(patches);
end
$do$;
