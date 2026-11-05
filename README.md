# BC Track Hub: Setup

The hub is a static website (GitHub Pages) that saves coach data to Supabase.
Anyone with the link can view it. Only coaches on the list can sign in and save.

About 30 minutes, start to finish.

## What's in this folder

| File | What it is |
|---|---|
| `index.html` | The whole site |
| `config.js` | Your Supabase address and key (you fill this in) |
| `sprints.js` | Sprints, Hurdles & Jumps program: Dec 1 – Feb 28, all 7 days (coach-led Tue/Thu with indoor/outdoor, fully written home days), drill library, block/hurdle/jump pathways, strength. Group assignments save to `sgroups`, coach day changes (closures, meets, moves) to `sprint_edits`. Spring weeks get added to `SP_WEEKS` in the same shape. |
| `supabase/setup.sql` | Creates the database tables and security rules, adds you as a coach, and copies over the event assignments you already saved |

---

## Step 1: Create the Supabase project (10 min)

1. Go to **supabase.com** and sign in (same account as BC-Track is fine).
2. Click **New project**. Name it `bc-track-hub`, set a database password (save it somewhere), pick the **East US** region, and create it. Wait a minute or two for it to finish.
3. In the left menu, open **SQL Editor** and click **New query**.
4. Open `supabase/setup.sql`, copy all of it, paste it in, and click **Run**. You should see "Success. No rows returned."
5. Open **Project Settings** (gear icon) and copy two things:
   - **Project URL**, under **Data API** (looks like `https://abcdefgh.supabase.co`)
   - The public key, under **API Keys**. Newer projects call it the **Publishable key** (starts with `sb_publishable_`); older ones call it the **anon public** key. Either works. Never use the **secret** / **service_role** key here.
6. Open `config.js` and paste them in place of `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY`. Save.

## Step 2: Put the site on GitHub Pages (10 min)

1. On **github.com**, click **+ → New repository**. Name it `bc-track-hub`, make it **Public**, and create it.
2. Click **uploading an existing file**. Drag in `index.html` and `config.js` (the `supabase` folder and this README are optional). Click **Commit changes**.
3. Go to **Settings → Pages**. Under **Branch**, pick `main` and `/ (root)`, then **Save**.
4. After a minute, your site is live at:
   **https://ryanwitt2014.github.io/bc-track-hub/**

## Step 3: Turn on coach sign-in (5 min)

Back in Supabase:

1. **Authentication → URL Configuration**
   - **Site URL:** `https://ryanwitt2014.github.io/bc-track-hub/`
   - **Redirect URLs:** add the same address.
   - Save.
2. **Authentication → Providers → Email**: make sure Email is turned on. Leave "Confirm email" on.

## Step 4: Test it

1. Open the site. Tap **Coach login**, enter `rwitt@benton.k12.in.us`, and tap **Email me a sign-in link**.
2. Open the email **on the same device** and tap the link. You'll land back on the hub, signed in, and the menu will say **Coaches**.
3. Go to **Coaches → Post Workouts**, post a test week, and look for the green "Saved."
4. Open the site in a private window. You should see the hub but only **Coach login**, no Coaches tab.
5. Delete the test week.

---

## Adding another coach

In Supabase **SQL Editor**, run (lowercase email):

```sql
insert into public.coaches (email) values ('coach@benton.k12.in.us');
```

They sign in the same way: **Coach login** → email → tap the link.

To remove a coach:

```sql
delete from public.coaches where email = 'coach@benton.k12.in.us';
```

## Changing things later

- **Show "First L." to the public:** in `config.js`, change `publicInitials: false` to `true` and upload the file again. Coaches still see full names when signed in.
- **Roster, records, schedule, form guides and other page content** live in `index.html`. Send it to Claude with what you want changed, then upload the new `index.html` to GitHub (drag it in and commit; it replaces the old one).
- **Workouts, warm-ups, data logs, recruiting, event assignments** are saved in Supabase by coaches from the Coaches tab. No file uploads needed.

## Good to know

- **Sign-in links** work best opened on the same device and browser you asked from. If a link doesn't sign you in, request a new one there.
- **Two coaches saving the same thing at once:** the second one gets a message that someone else just saved, the page loads the latest version, and they redo their change. Nothing gets silently overwritten.
- **Backups:** don't count on the free plan for backups. To save a copy any time, go to **Table Editor → hub_data → Export to CSV**. Doing that once a month during the season is plenty.
- **Free plan:** Supabase pauses a free project after about a week with no activity. During the season that won't happen; if it does, open the project in Supabase and click **Restore**.
- **The anon key in `config.js` is meant to be public.** The database rules in `setup.sql` are what stop anyone who isn't on the coaches list from saving.

## Scouting (coaches only)

Opponent results for scouting live in four coach-only tables: `schools`, `meets`, `import_batches`, `results`.
Nobody who isn't signed in as a coach can read them.

1. One-time setup: in Supabase, open **SQL Editor**, paste `supabase/migrations/001_scouting.sql`, and click **Run**. It's safe to run again.
2. On the Hub: **Coaches → Scouting → Import results**. Fill in the meet, then upload a CSV or paste rows
   (template: `supabase/templates/scouting-results-template.csv`). Check the preview, then save.
3. Re-importing the same results is safe: rows already in the system are skipped.
4. Fix a typo on the **Results** tab (the original import row is kept). Same school under two names? **Schools → Merge**.

The code for this lives in `intelligence.js`.
