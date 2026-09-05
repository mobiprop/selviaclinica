# Production setup

Selvia Dashboard runs on Supabase (Postgres + Auth). Follow these steps in
order — nothing in the app works without step 1.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → sign in → **New project**.
2. Pick an organization, name (e.g. `selvia-clinica`), a database password
   (save it somewhere safe), and a region close to the clinic.
3. Wait for provisioning (~2 minutes).
4. **Project Settings → API** → copy three values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / publishable key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (click reveal) → `SUPABASE_SERVICE_ROLE_KEY`
5. Paste all three into `.env.local` (copy `.env.example` to `.env.local`
   first if you haven't).

## 2. Apply the database schema

1. In the Supabase Dashboard, open **SQL Editor**.
2. Paste the contents of `supabase/migrations/0001_init.sql` and run it.
   This creates `appointments`, `supplies`, `app_settings`,
   `integration_connections`, `integration_tokens`, and `profiles`, with row
   level security policies already applied.

## 3. Load the real clinic data

From the project root, with `.env.local` filled in from step 1:

```bash
node --env-file=.env.local scripts/migrate-seed-data.ts
```

This loads the 370+ reconciled appointments and 232 supplies already in the
codebase (`src/data/seed-appointments.ts`, `src/data/seed-supplies.ts`) into
your new tables, plus the default monthly target. Safe to re-run.

## 4. Create your staff login

There's no public sign-up page on purpose — a clinic dashboard shouldn't let
strangers register. Create the first (and any additional) account yourself:

1. Supabase Dashboard → **Authentication → Users → Add user**.
2. Enter an email and password, and check **Auto Confirm User** so it's
   usable immediately (no email verification flow to configure).
3. Sign in at `/login` with those credentials.

## 5. MCP Connection

Already generated for you in `.env.local` as `MCP_API_KEY`. Nothing else to
do — the Integrations page's "Connect" button on MCP Connection works as
soon as the app is running.

## 6. Google Calendar / Google Drive (optional)

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   → create or pick a project.
2. **APIs & Services → Library** → enable the Google Calendar API and the
   Google Drive API.
3. **APIs & Services → OAuth consent screen** → configure it (External is
   fine) and add your own Google account under **Test users**.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   → Application type: **Web application**.
5. Under **Authorized redirect URIs**, add:
   `http://localhost:3000/api/integrations/google/callback` (add your
   production URL too once deployed).
6. Copy the **Client ID** and **Client Secret** into `.env.local` as
   `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. One client
   covers both Calendar and Drive.

## 7. Meta Ads (optional)

1. [Meta for Developers](https://developers.facebook.com/apps) → create an
   app (type: Business).
2. Add the **Facebook Login** product.
3. **Facebook Login → Settings** → add
   `http://localhost:3000/api/integrations/meta/callback` under **Valid
   OAuth Redirect URIs**.
4. **App Roles → Roles** → make sure your own Facebook account is listed
   (required while the app is in Development mode).
5. **Settings → Basic** → copy the **App ID** and **App Secret** into
   `.env.local` as `NEXT_PUBLIC_META_APP_ID` and `META_APP_SECRET`.
6. This works immediately for your own ad account in Development mode.
   Reaching other users' ad accounts needs Meta App Review for `ads_read`.

## 8. AI Data (optional)

1. Get an API key at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).
2. Set it as `ANTHROPIC_API_KEY` in `.env.local`.
3. The AI Data page lets staff ask questions about patients, revenue, and
   supplies in a Claude-style chat — it calls the same Supabase tables
   directly (as the signed-in user, so the same row-level security applies),
   not the MCP endpoint.

## 9. Restart and verify

```bash
npm run dev
```

- Visiting any page redirects to `/login` until you sign in.
- After signing in, Patients/Insumos/Dashboard should show the real migrated
  data — add or edit something, refresh the page, and confirm it persisted
  (proves it's reading from Supabase, not just React state).
- Integrations page: MCP Connection should connect immediately; Google/Meta
  show setup instructions until steps 6/7 are done, then run a real OAuth
  popup.
- AI Data page: shows setup instructions until step 8 is done, then answers
  questions using your real data.

## Deploying

Any Next.js host works (Vercel is the path of least resistance for this
stack). Whichever you pick:

- Set every variable from `.env.local` in the host's environment config —
  they are **not** read from a committed file in production.
- Update `NEXT_PUBLIC_APP_URL` to the real production URL, and add the
  matching production redirect URIs in Google Cloud Console / Meta App
  Dashboard (steps 6.5 / 7.3) — OAuth will fail on the live domain until
  those are added.
- Run `npm run build` locally first to catch anything environment-specific
  before pushing.
