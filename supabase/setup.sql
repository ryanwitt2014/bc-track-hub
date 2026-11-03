-- BC Track Hub: database setup
-- Paste this whole file into Supabase > SQL Editor > New query, then click Run. Run it once.

-- 1. Where the hub's data lives (workouts, warm-ups, logs, recruiting, event assignments)
create table if not exists public.hub_data (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- 2. Who counts as a coach (can sign in and save)
create table if not exists public.coaches (
  email text primary key
);

-- 3. Security rules
alter table public.hub_data enable row level security;
alter table public.coaches  enable row level security;

create or replace function public.is_coach() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.coaches c where c.email = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;

drop policy if exists "Anyone can read the hub"   on public.hub_data;
drop policy if exists "Coaches can add"            on public.hub_data;
drop policy if exists "Coaches can update"         on public.hub_data;
drop policy if exists "Coach can see own row"      on public.coaches;

create policy "Anyone can read the hub" on public.hub_data for select using (true);
create policy "Coaches can add"         on public.hub_data for insert to authenticated with check (public.is_coach());
create policy "Coaches can update"      on public.hub_data for update to authenticated using (public.is_coach()) with check (public.is_coach());
create policy "Coach can see own row"   on public.coaches  for select to authenticated using (email = lower(coalesce(auth.jwt() ->> 'email', '')));

-- 4. Coaches. Add more lines like this for each coach (lowercase emails).
insert into public.coaches (email) values
  ('rwitt@benton.k12.in.us')
on conflict do nothing;

-- 5. Carry over what's already been saved in the hub
insert into public.hub_data (key, value) values
  ('assignments', $json${"HS-B":{"100":["hs-matthew-drake","hs-otoniel-padilla-aquino","hs-kayden-wade","hs-kian-yeary","hs-gabe-holt","hs-elijah-justice","hs-case-bramer"],"200":["hs-matthew-drake","hs-alex-glotzbach","hs-otoniel-padilla-aquino","hs-kian-yeary","hs-gabe-holt","hs-chris-ingram","hs-elijah-justice"],"400":["hs-alex-glotzbach","hs-parker-vanallen","hs-kian-yeary","hs-chris-ingram","hs-ezreall-roberson"],"800":["hs-sam-fleming","hs-matthew-mckinnis","hs-adler-payne","hs-landon-dennis","hs-gideon-fisher","hs-gabe-ingram","hs-jacob-pitstick","hs-case-bramer"],"1600":["hs-sam-fleming","hs-matthew-mckinnis","hs-adler-payne","hs-ezreall-roberson","hs-landon-dennis","hs-gideon-fisher","hs-jacob-pitstick","hs-dietrich-payne"],"3200":["hs-sam-fleming","hs-adler-payne","hs-grant-slaughter","hs-louie-pyke","hs-cameron-glotzbach","hs-dietrich-payne"],"SP":["hs-dominic-dean","hs-bransen-jones","hs-carson-brost","hs-ethan-hood","hs-matthew-vanderwall","hs-beau-budreau"],"DT":["hs-dominic-dean","hs-bransen-jones","hs-carson-brost","hs-ethan-hood","hs-matthew-vanderwall","hs-beau-budreau"],"LJ":["hs-matthew-drake","hs-parker-vanallen","hs-kayden-wade","hs-gideon-fisher"],"HJ":["hs-parker-vanallen","hs-otoniel-padilla-aquino","hs-beau-budreau","hs-jacob-pitstick"],"300H":["hs-parker-vanallen"],"110H":["hs-beau-budreau"],"4x100":["hs-kayden-wade","hs-matthew-drake","hs-ezreall-roberson","hs-elijah-justice","hs-gabe-holt","hs-case-bramer"],"4x400":["hs-matthew-mckinnis","hs-alex-glotzbach","hs-ezreall-roberson","hs-kayden-wade","hs-adler-payne","hs-landon-dennis","hs-gideon-fisher","hs-elijah-justice","hs-chris-ingram","hs-jacob-pitstick","hs-gabe-ingram","hs-case-bramer"],"4x800":["hs-matthew-mckinnis","hs-alex-glotzbach","hs-sam-fleming"]},"HS-G":{"100":["hs-olive-budreau","hs-kendall-gephart","hs-veda-duttlinger","hs-paige-renfrow","hs-brianna-mendoza","hs-riley-sowders","hs-morgan-chapman","hs-delilah-fuller","hs-olivia-hall","hs-amari-miller","hs-ella-sims","hs-ella-stacy","hs-laila-stewart"],"200":["hs-kendall-gephart","hs-zoe-butzke","hs-ava-hands","hs-paige-renfrow","hs-sarah-lambeck","hs-brianna-mendoza","hs-morgan-chapman","hs-delilah-fuller","hs-olivia-hall"],"400":["hs-ava-hands","hs-sarah-lambeck","hs-maya-morales","hs-loralei-rayman"],"800":["hs-loralei-rayman","hs-harlo-holder","hs-maggie-rayman","hs-river-gobel","hs-lillian-weigle","hs-maya-morales"],"1600":["hs-loralei-rayman","hs-maggie-rayman","hs-river-gobel","hs-lillian-weigle"],"3200":["hs-cecelia-fisher","hs-harlo-holder","hs-lillian-weigle"],"300H":["hs-olive-budreau","hs-laurana-dillon","hs-riley-sowders"],"PV":["hs-laurana-dillon","hs-briseis-dean"],"LJ":["hs-laurana-dillon","hs-sarah-lambeck","hs-morgan-chapman","hs-delilah-fuller","hs-olivia-hall","hs-laila-stewart"],"SP":["hs-azlee-reynolds","hs-ashira-dean","hs-briseis-dean","hs-cailey-jones","hs-emily-mullendore","hs-kenzie-oswald","hs-ella-stacy"],"DT":["hs-azlee-reynolds","hs-ashira-dean","hs-veda-duttlinger","hs-briseis-dean","hs-cailey-jones","hs-emily-mullendore","hs-kenzie-oswald","hs-ella-stacy"],"100H":["hs-zoe-butzke","hs-millie-stinson"],"HJ":["hs-zoe-butzke","hs-maggie-rayman","hs-riley-sowders"],"4x400":["hs-river-gobel","hs-lillian-weigle","hs-olive-budreau","hs-ava-hands","hs-sarah-lambeck","hs-paige-renfrow","hs-ella-stacy","hs-laila-stewart","hs-maya-morales"],"4x100":["hs-olive-budreau","hs-kendall-gephart","hs-paige-renfrow","hs-riley-sowders","hs-zoe-butzke","hs-veda-duttlinger","hs-brianna-mendoza","hs-delilah-fuller","hs-morgan-chapman","hs-olivia-hall","hs-laila-stewart","hs-millie-stinson"],"4x800":["hs-loralei-rayman","hs-maggie-rayman","hs-harlo-holder","hs-river-gobel","hs-maya-morales"]},"JH-B":{"100":["jh-noah-akins","jh-gavin-gobel"],"200":[],"400":["jh-noah-akins","jh-jorge-marcial","jh-gavin-gobel","jh-graysson-freeman-rider","jh-wyatt-weigle","jh-tripp-johnson","jh-noah-ellis","jh-charlie-biddle","jh-wyatt-kelp"],"800":["jh-wesley-weigle","jh-graysson-freeman-rider","jh-wyatt-weigle","jh-jorge-marcial","jh-charlie-biddle","jh-tripp-johnson","jh-noah-ellis","jh-wyatt-kelp"],"1600":["jh-wesley-weigle","jh-graysson-freeman-rider","jh-charlie-biddle","jh-tripp-johnson","jh-wyatt-kelp","jh-noah-ellis"],"HJ":["jh-noah-akins","jh-clark-tyson","jh-wesley-weigle"],"SP":["jh-gabe-devers","jh-logan-pyke","jh-luke-rayman","jh-carter-norris"],"DT":["jh-gabe-devers","jh-logan-pyke","jh-carter-norris"],"LJ":["jh-jorge-marcial","jh-gavin-gobel","jh-wyatt-weigle"],"110H":["jh-luke-rayman","jh-gavin-gobel"],"4x100":["jh-luke-rayman","jh-noah-akins"],"4x400":["jh-jorge-marcial","jh-wesley-weigle","jh-graysson-freeman-rider","jh-wyatt-weigle"]},"JH-G":{"100":["jh-destiny-barrera","jh-jordan-hands","jh-adella-walker","jh-harlow-lynch"],"200":["jh-destiny-barrera","jh-adella-walker","jh-harlow-lynch"],"400":["jh-claire-bauer","jh-tynlee-becker","jh-harlow-lynch","jh-celie-bush","jh-annabelle-thomas","jh-alyza-kelp"],"800":["jh-zuria-felker","jh-josie-adams","jh-eva-morales","jh-zyana-felker","jh-corinn-hughes","jh-annabelle-thomas","jh-alyza-kelp"],"1600":["jh-zuria-felker","jh-josie-adams","jh-eva-morales","jh-zyana-felker","jh-alyza-kelp","jh-annabelle-thomas"],"100H":["jh-destiny-barrera","jh-claire-bauer","jh-tynlee-becker"],"4x400":["jh-celie-bush","jh-claire-bauer","jh-zuria-felker","jh-adella-walker"],"HJ":["jh-celie-bush","jh-tynlee-becker"],"SP":["jh-olivia-crowder","jh-kaci-howard"],"DT":["jh-olivia-crowder","jh-kaci-howard"],"4x100":["jh-adella-walker","jh-celie-bush","jh-jordan-hands"]}}$json$::jsonb),
  ('logs',        $json${"jh-wyatt-weigle":{"log":[],"meets":[],"goals":{}}}$json$::jsonb)
on conflict (key) do nothing;
