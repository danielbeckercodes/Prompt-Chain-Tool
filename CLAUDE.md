@AGENTS.md

## Project: Prompt Chain Tool

**Always read `IMPLEMENTATION_PLAN.md` IN FULL before making any changes.** It is the source of truth for all implementation work.

### How to Work on This Project
1. Read this file (CLAUDE.md) and IMPLEMENTATION_PLAN.md fully before writing any code
2. Find your current phase in the plan — look for the "Agent Instructions" block
3. Follow the instructions in that block exactly — it tells you what to build, what files to touch, and what NOT to do
4. Use the "Database Schema (Discovered)" section for all column names, types, and relationships
5. Use the "UI Design System" section for all styling — do not invent new colors, spacing, or component patterns
6. When done, run the verification steps listed at the bottom of your phase's instructions
7. Mark completed tasks with [x] in the plan
8. Do NOT work on tasks from other phases — each phase is self-contained

### UI Rules (CRITICAL)
- Follow the "UI Design System" section in IMPLEMENTATION_PLAN.md for ALL styling decisions
- Use only the color classes listed there — no hardcoded hex/rgb, no custom Tailwind colors
- Use `<Suspense>` boundaries with skeleton fallbacks for every data-fetching component
- Never show a blank page — always render the layout shell + skeletons while data loads
- No UI libraries (no shadcn, no headlessui, no radix) — plain Tailwind only

### Key Facts
- Next.js 16.2.1 (uses `proxy.ts`, NOT `middleware.ts`)
- Supabase for auth + database
- REST API: `POST https://api.almostcrackd.ai` for caption generation (staging, from Assignment 5)
- API calls go through a server-side proxy route (`/api/generate`) — never call the REST API directly from the browser
- Tailwind CSS v4 (configured inline in `globals.css`, no separate config file)
- Access restricted to users with `profiles.is_superadmin == true` OR `profiles.is_matrix_admin == true`

### Auth Rules (CRITICAL — read before touching auth)
- **Google OAuth ONLY** — do NOT implement email/password, magic link, or any other auth method
- Google OAuth Client ID: `388960353527-fh4grc6mla425lg0e3g1hh67omtrdihd.apps.googleusercontent.com` (configured in Supabase Dashboard, not in app code)
- No Google Client Secret needed in the app
- Use `@supabase/ssr` for server/browser client wiring and `@supabase/supabase-js` for Auth API calls
- Login flow: `supabase.auth.signInWithOAuth({ provider: 'google' })` → Google consent → Supabase → `/auth/callback`
- **Callback route MUST be `/auth/callback`** — a GET route handler at `src/app/auth/callback/route.ts` that calls `supabase.auth.exchangeCodeForSession(code)`
- Do NOT redirect to any other callback path or add extra query parameters to the redirect URI
- After login, check `profiles.is_superadmin` or `profiles.is_matrix_admin` — deny access if neither is true
