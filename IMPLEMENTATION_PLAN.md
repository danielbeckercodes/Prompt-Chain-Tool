# Prompt Chain Tool — Implementation Plan

> **Source of truth** for all agents working on this project.
> Read this file IN FULL before making any changes.
> Each phase has agent instructions — follow them exactly.

---

## Project Overview

A Next.js 16 + Supabase app for managing **humor flavors** — prompt chains that generate captions from images. Each humor flavor is an ordered set of steps (a prompt chain). Users can create, edit, reorder steps, and test flavors by generating captions via the REST API at `https://api.almostcrackd.ai`.

### Core Concept: Prompt Chain

A humor flavor is a **sequential chain of prompts**. Each step receives the output of the previous step as its input. The first step receives an image.

**Example chain (3 steps):**
1. **Step 1** — Input: an image → Output: a text description of the image
2. **Step 2** — Input: text from step 1 → Output: something funny about it
3. **Step 3** — Input: text from step 2 → Output: five short, funny captions

Each step's prompt defines what the LLM should do with the input it receives. The chain runs sequentially: step 1 → step 2 → step 3. The final step's output is the generated caption(s).

When building step forms and the testing UI, this chaining model must be clear:
- Step 1 is always the image input step
- Each subsequent step receives the prior step's text output
- The prompt text for each step should describe the transformation to apply

### Tech Stack
- **Next.js 16.2.1** (App Router, `proxy.ts` instead of `middleware.ts`)
- **React 19** with Server Components
- **TypeScript 5**
- **Tailwind CSS 4** (configured via `@theme inline` in `globals.css`, NO separate tailwind.config file)
- **Supabase** (`@supabase/ssr` + `@supabase/supabase-js`)
- **REST API**: `POST https://api.almostcrackd.ai` (staging, from Assignment 5)

---

## UI Design System

> **Every phase must follow these rules.** This section is the single
> reference for visual design. Do not invent new patterns — reuse what's here.

### Philosophy
- **Minimalist and functional** — no decorative elements, no gradients, no shadows heavier than `shadow-sm`
- **Content-first** — the data is the UI. Reduce chrome to the minimum needed for navigation and actions
- **Quiet until needed** — loading states, errors, and confirmations appear only when relevant, then disappear

### Color System (Tailwind classes only)
Use these consistently. Do NOT hardcode hex/rgb values in components.

| Role | Light Mode | Dark Mode |
|------|-----------|-----------|
| Background (page) | `bg-zinc-50` | `dark:bg-zinc-950` |
| Background (card/surface) | `bg-white` | `dark:bg-zinc-900` |
| Background (hover) | `hover:bg-zinc-100` | `dark:hover:bg-zinc-800` |
| Border | `border-zinc-200` | `dark:border-zinc-800` |
| Text (primary) | `text-zinc-900` | `dark:text-zinc-100` |
| Text (secondary) | `text-zinc-500` | `dark:text-zinc-400` |
| Text (muted/placeholder) | `text-zinc-400` | `dark:text-zinc-500` |
| Primary action | `bg-zinc-900 text-white` | `dark:bg-zinc-100 dark:text-zinc-900` |
| Primary action hover | `hover:bg-zinc-700` | `dark:hover:bg-zinc-300` |
| Destructive | `text-red-600` | `dark:text-red-400` |
| Success | `text-green-600` | `dark:text-green-400` |

### Typography
- Font: Geist Sans (already loaded in layout.tsx via `next/font/google`)
- Headings: `font-semibold tracking-tight`
  - Page title: `text-2xl`
  - Section title: `text-lg font-medium`
  - Card title: `text-base font-medium`
- Body: `text-sm text-zinc-600 dark:text-zinc-400`
- Monospace (for prompt text / code): `font-mono text-sm`

### Component Patterns

**Buttons:**
```
Primary:   px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors
Secondary: px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors
Danger:    px-4 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 transition-colors
Icon btn:  p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors
```

**Cards / Surfaces:**
```
rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900
```

**Inputs:**
```
w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-100/20
```

**Textareas (for prompt text):**
Same as input but add `font-mono min-h-[120px] resize-y`

**Tables / Lists:**
- Use `divide-y divide-zinc-100 dark:divide-zinc-800` for row separation
- No heavy table borders — just dividers
- Row hover: `hover:bg-zinc-50 dark:hover:bg-zinc-800/50`

**Empty States:**
- Centered text: `text-sm text-zinc-400 dark:text-zinc-500 py-12 text-center`
- Include a call-to-action button when applicable (e.g., "No flavors yet" + "Create your first flavor" button)

**Modals / Dialogs:**
- Backdrop: `fixed inset-0 bg-black/50 z-50`
- Panel: `rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900 max-w-md w-full mx-auto`
- Always closable via X button and backdrop click

### Layout Structure
- **Header**: fixed top, full width, `h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950`
- **Sidebar** (desktop): `w-56 border-r border-zinc-200 dark:border-zinc-800`, hidden on mobile
- **Main content**: `max-w-4xl mx-auto px-6 py-8`
- **Mobile**: sidebar collapses to a hamburger menu

### Loading & Suspense
- Use React `<Suspense>` boundaries with skeleton fallbacks for every data-fetching section
- **Page-level**: wrap the main content of each page in `<Suspense fallback={<PageSkeleton />}>`
- **Section-level**: wrap independent data sections (e.g., caption history on flavor detail page) in their own `<Suspense>` so the page shell loads immediately
- **Skeletons**: use `animate-pulse` with `bg-zinc-200 dark:bg-zinc-800 rounded` blocks matching the approximate shape of real content
- **Button loading**: disable the button + show a small spinner (not a skeleton)
- **Never show a blank white page** — always show at least the layout shell + skeletons

### Toast Notifications
- Position: bottom-right, `fixed bottom-4 right-4`
- Style: `rounded-lg border px-4 py-3 text-sm shadow-sm` with appropriate color
- Auto-dismiss after 3 seconds
- Keep it simple — no toast library needed. A state array + setTimeout is sufficient.

### Spacing Conventions
- Between page sections: `space-y-8`
- Between cards/items in a list: `space-y-3`
- Inside cards: `p-6`, use `space-y-4` between content groups
- Between form fields: `space-y-4`
- Between buttons in a row: `gap-3`

## Phase 0: Database Discovery

> **Status: COMPLETE**

### Agent Instructions — Phase 0

```
CONTEXT: You are starting Phase 0 of the Prompt Chain Tool project.
Read IMPLEMENTATION_PLAN.md and CLAUDE.md first.

GOAL: Discover the full database schema using the Supabase MCP tools.
Do NOT write any application code in this phase.

TASKS:
1. Use Supabase MCP to list all tables in the database
2. For each relevant table, get columns, types, constraints, and defaults
3. Get all foreign key relationships between tables
4. Get RLS policies on each relevant table
5. Check for Supabase storage buckets (for test images)
6. Look specifically for these tables:
   - profiles (need is_superadmin, is_matrix_admin columns)
   - humor_flavors
   - humor_flavor_steps (how is ordering stored?)
   - Any captions/generated_captions table
   - Any image test set / test images table
7. Investigate the REST API at https://api.almostcrackd.ai (see
   "REST API" section below for what we know so far)

DELIVERABLE: Update IMPLEMENTATION_PLAN.md by adding a new section
called "## Database Schema (Discovered)" right after this Phase 0
section. Use the EXACT FORMAT shown in the template below.
Also fill in the "Key Decisions" section at the bottom with answers.

SCHEMA FORMAT — use this exact template for each table:

### `table_name`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | PK |
| name | text | NO | — | |
| ... | ... | ... | ... | ... |

**Foreign Keys:**
- `column_name` → `other_table.column`

**RLS Policies:**
- policy_name: description of who can do what

**Used by this app for:** one sentence explaining what this table
means in the context of the Prompt Chain Tool.

IMPORTANT:
- Only document tables relevant to this project. Skip unrelated tables
  but mention them briefly ("Other tables exist: x, y, z — not used
  by this app").
- For the profiles table, document ALL columns — the agent building
  auth needs to know the full shape.
- For humor_flavors and humor_flavor_steps, document ALL columns —
  agents building CRUD need every field.
- For captions/images tables, document ALL columns.
- The "Notes" column should flag things like: "this is the ordering
  column", "FK to humor_flavors", "used for admin check", etc.

DO NOT:
- Write any application code
- Create any new source files
- Install any packages
- Modify any file other than IMPLEMENTATION_PLAN.md

VERIFY: After updating the plan, re-read it to confirm:
1. Every table has the markdown table format shown above
2. All foreign keys are documented
3. RLS policies are listed
4. The Key Decisions section at the bottom has concrete answers
5. The schema section is positioned right after this Phase 0 section
```

### Tables to Discover

- [x] `profiles` — specifically `is_superadmin` and `is_matrix_admin` columns
- [x] `humor_flavors` — columns, types, relationships
- [x] `humor_flavor_steps` — columns, types, ordering mechanism (`order_by` smallint)
- [x] Any `captions` or `generated_captions` table — `captions` table found
- [x] Any `image_test_sets`, `test_images`, or related tables — `study_image_sets` + `study_image_set_image_mappings` + `images.is_common_use`
- [x] Any Supabase storage buckets for images — public `images` bucket
- [x] Auth setup — Google OAuth via Supabase, profiles table for admin check
- [x] RLS policies — only `profiles` and `images` have RLS enabled

### REST API: `https://api.almostcrackd.ai`

**What we know:**
- It's a POST endpoint (staging environment)
- It's the API from Assignment 5
- It generates captions using a humor flavor's prompt chain against an image
- Auth likely uses the user's Supabase Bearer token

**What the Phase 0 agent should try to discover:**
- The exact endpoint path (e.g., `POST /generate`, `POST /captions`, etc.)
- Request body format (does it take a flavor ID? image URL? base64 image?)
- Response body format (array of captions? object with steps?)
- Auth header format (`Authorization: Bearer <supabase-token>`?)

**If the API can't be fully discovered in Phase 0** (no docs, can't test),
document what you found and leave a note. The Phase 5 agent will handle
the remaining API integration and can test the API directly at that point.

**Deliverable:** Update this plan with actual table schemas and API contract before proceeding.

---

## Database Schema (Discovered)

> Discovered via Supabase MCP on 2026-03-22. There are 58 tables in the `public` schema.
> Only tables relevant to the Prompt Chain Tool are documented below.

**Other tables not used by this app:** `allowed_signup_domains`, `bug_reports`, `caption_examples`, `caption_likes`, `caption_saved`, `caption_votes`, `common_use_categories`, `common_use_category_image_mappings`, `communities`, `community_context_tag_mappings`, `community_context_tags`, `community_contexts`, `dorms`, `invitations`, `link_redirects`, `news_entities`, `news_snippets`, `personalities`, `profile_dorm_mappings`, `profile_university_major_mappings`, `profile_university_mappings`, `reported_captions`, `reported_images`, `screenshots`, `share_to_destinations`, `shares`, `sidechat_posts`, `studies`, `study_caption_mappings`, `term_types`, `terms`, `testflight_errors`, `transcript_personality_mappings`, `transcripts`, `universities`, `university_major_mappings`, `university_majors`, `v_richest_image_dedup`, `whitelist_email_addresses`

### `profiles`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | — | PK, matches `auth.users.id` |
| created_datetime_utc | timestamptz | NO | now() | |
| modified_datetime_utc | timestamptz | NO | now() | |
| first_name | varchar | YES | — | |
| last_name | varchar | YES | — | |
| email | text | YES | — | |
| is_superadmin | boolean | NO | true | **Used for admin check** |
| is_in_study | boolean | NO | false | Not used by this app |
| is_matrix_admin | boolean | NO | false | **Used for admin check** |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id (self-ref) |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id (self-ref) |

**Foreign Keys:**
- `created_by_user_id` → `profiles.id`
- `modified_by_user_id` → `profiles.id`

**RLS:** Enabled
- `Own profile view + admin view all`: SELECT — own profile or superadmin sees all
- `Authenticated users can create their own profile`: INSERT — id must match auth.uid()
- `Users can update their own profile`: UPDATE — own profile or superadmin
- `Non-admins cannot set is_superadmin`: RESTRICTIVE UPDATE — only superadmins can set is_superadmin=true
- `Anonymous users cannot escalate to admin privileges`: RESTRICTIVE UPDATE — blocks anon users from admin escalation
- `Own profile delete + admin delete all`: DELETE — own or superadmin

**Used by this app for:** Admin access check — query `is_superadmin` or `is_matrix_admin` to determine if a logged-in user can access the app.

---

### `humor_flavors`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | bigint | NO | — | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| description | text | YES | — | |
| slug | varchar | NO | — | **Display name / identifier** |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_datetime_utc | timestamptz | NO | now() | |

**Foreign Keys:**
- `created_by_user_id` → `profiles.id`
- `modified_by_user_id` → `profiles.id`

**RLS:** Not enabled (no policies, no row security)

**Used by this app for:** Core entity — a humor flavor is a named prompt chain. The `slug` serves as the display name. CRUD operations in Phase 3.

---

### `humor_flavor_steps`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | bigint | NO | — | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| humor_flavor_id | bigint | NO | — | FK → humor_flavors.id |
| llm_temperature | numeric | YES | — | Model temperature setting |
| order_by | smallint | NO | — | **Ordering column for the chain** |
| llm_input_type_id | smallint | NO | — | FK → llm_input_types.id |
| llm_output_type_id | smallint | NO | — | FK → llm_output_types.id |
| llm_model_id | smallint | NO | — | FK → llm_models.id |
| humor_flavor_step_type_id | smallint | NO | — | FK → humor_flavor_step_types.id |
| llm_system_prompt | text | YES | — | System prompt for the LLM |
| llm_user_prompt | text | YES | — | User prompt for the LLM |
| description | varchar | YES | — | Human-readable step description |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_datetime_utc | timestamptz | NO | now() | |

**Foreign Keys:**
- `humor_flavor_id` → `humor_flavors.id`
- `humor_flavor_step_type_id` → `humor_flavor_step_types.id`
- `llm_input_type_id` → `llm_input_types.id`
- `llm_output_type_id` → `llm_output_types.id`
- `llm_model_id` → `llm_models.id`
- `created_by_user_id` → `profiles.id`
- `modified_by_user_id` → `profiles.id`

**RLS:** Not enabled

**Used by this app for:** Individual steps in a prompt chain. Ordered by `order_by` (smallint). Each step defines which LLM model to use, the system/user prompts, input/output types, and temperature. CRUD + reorder in Phase 4.

---

### `humor_flavor_step_types`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | smallint | NO | — | PK |
| created_at | timestamptz | NO | now() | |
| slug | varchar | NO | — | Identifier |
| description | text | NO | — | Human-readable description |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| created_datetime_utc | timestamptz | NO | now() | |
| modified_datetime_utc | timestamptz | NO | now() | |

**Existing data:**
| id | slug | description |
|----|------|-------------|
| 1 | celebrity-recognition | Identifies celebrities and brands in an image |
| 2 | image-description | Creates a thorough description of a given image |
| 3 | general | Standard step: text in → text out |

**RLS:** Not enabled

**Used by this app for:** Lookup table classifying what kind of step this is (image description, celebrity recognition, or general text transform). Displayed in step forms as a dropdown.

---

### `llm_models`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | smallint | NO | — | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| name | varchar | NO | — | Display name (e.g. "GPT-4.1") |
| llm_provider_id | smallint | NO | — | FK → llm_providers.id |
| provider_model_id | varchar | NO | — | API model identifier (e.g. "gpt-4.1-2025-04-14") |
| is_temperature_supported | boolean | NO | false | Whether temperature param is supported |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_datetime_utc | timestamptz | NO | now() | |

**Existing data:** 20 models including GPT-4.1, GPT-4.1-mini, GPT-4.1-nano, GPT-4.5-preview, GPT-4o, GPT-4o-mini, o1, Grok-2-vision, Grok-3, Grok-4, Gemini 2.5 Pro, Gemini 2.5 Flash, GPT 5 family, etc.

**RLS:** Not enabled

**Used by this app for:** Dropdown in step forms to select which LLM model a step uses.

---

### `llm_providers`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | smallint | NO | — | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| name | varchar | NO | — | Provider name |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_datetime_utc | timestamptz | NO | now() | |

**Existing data:** OpenAI (1), Google (2), 111167/xAI (3), plus test entries

**RLS:** Not enabled

**Used by this app for:** Grouping LLM models by provider. May be displayed alongside model name in step forms.

---

### `llm_input_types`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | smallint | NO | — | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| description | varchar | NO | — | Human-readable label |
| slug | varchar | NO | — | Identifier |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_datetime_utc | timestamptz | NO | now() | |

**Existing data:**
| id | slug | description |
|----|------|-------------|
| 1 | image-and-text | Image and text input |
| 2 | text-only | Text only input |

**RLS:** Not enabled

**Used by this app for:** Defines what input a step accepts. Step 1 typically uses `image-and-text` (id=1), subsequent steps use `text-only` (id=2). Dropdown in step forms.

---

### `llm_output_types`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | smallint | NO | — | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| description | varchar | NO | — | Human-readable label |
| slug | varchar | NO | — | Identifier |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_datetime_utc | timestamptz | NO | now() | |

**Existing data:**
| id | slug | description |
|----|------|-------------|
| 1 | string | String |
| 2 | array | Array |

**RLS:** Not enabled

**Used by this app for:** Defines the output format of a step. Dropdown in step forms.

---

### `captions`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| modified_datetime_utc | timestamptz | NO | now() | |
| content | varchar | YES | — | The generated caption text |
| is_public | boolean | NO | — | Whether caption is publicly visible |
| profile_id | uuid | NO | — | FK → profiles.id (who generated it) |
| image_id | uuid | NO | — | FK → images.id |
| humor_flavor_id | bigint | YES | — | FK → humor_flavors.id |
| is_featured | boolean | NO | false | |
| caption_request_id | bigint | YES | — | FK → caption_requests.id |
| like_count | bigint | NO | 0 | |
| llm_prompt_chain_id | bigint | YES | — | FK → llm_prompt_chains.id |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |

**Foreign Keys:**
- `profile_id` → `profiles.id`
- `image_id` → `images.id`
- `humor_flavor_id` → `humor_flavors.id`
- `caption_request_id` → `caption_requests.id`
- `llm_prompt_chain_id` → `llm_prompt_chains.id`
- `created_by_user_id` → `profiles.id`
- `modified_by_user_id` → `profiles.id`

**RLS:** Not enabled (policies exist but `rowsecurity` is OFF on the table)
- Policies defined but not enforced: public read for public captions, own+admin update/delete, etc.

**Used by this app for:** Stores generated captions. Filter by `humor_flavor_id` to show caption history on the flavor detail page (Phase 5).

---

### `images`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| modified_datetime_utc | timestamptz | NO | now() | |
| url | varchar | YES | — | Image URL |
| is_common_use | boolean | YES | false | Common/stock images available to all |
| profile_id | uuid | YES | auth.uid() | FK → profiles.id (uploader) |
| additional_context | varchar | YES | — | Extra context about the image |
| is_public | boolean | YES | false | |
| image_description | text | YES | — | AI-generated description |
| celebrity_recognition | text | YES | — | AI-generated celebrity/brand recognition |
| embedding | vector | YES | — | Image embedding for similarity search |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |

**Foreign Keys:**
- `profile_id` → `profiles.id`
- `created_by_user_id` → `profiles.id`
- `modified_by_user_id` → `profiles.id`

**RLS:** Enabled
- Own images + common use + public: authenticated users see their own, common-use, public, or all if superadmin
- Authenticated users can upload (profile_id must match; only superadmins can set is_common_use=true)
- Own+admin update/delete

**Used by this app for:** Source images for caption generation. Use `is_common_use=true` images as the test image set for testing flavors.

---

### `caption_requests`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | bigint | NO | — | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| profile_id | uuid | NO | — | FK → profiles.id |
| image_id | uuid | NO | — | FK → images.id |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_datetime_utc | timestamptz | NO | now() | |

**Foreign Keys:**
- `profile_id` → `profiles.id`
- `image_id` → `images.id`

**RLS:** Not enabled

**Used by this app for:** Tracks individual caption generation requests. Links a user to an image for a generation run.

---

### `llm_prompt_chains`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | bigint | NO | — | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| caption_request_id | bigint | NO | — | FK → caption_requests.id |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_datetime_utc | timestamptz | NO | now() | |

**Foreign Keys:**
- `caption_request_id` → `caption_requests.id`

**RLS:** Not enabled

**Used by this app for:** Represents one execution of a prompt chain for a caption request. Links to `llm_model_responses` for step-by-step outputs.

---

### `llm_model_responses`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| llm_model_response | text | YES | — | The LLM's response text |
| processing_time_seconds | smallint | NO | — | How long the LLM call took |
| llm_model_id | smallint | NO | — | FK → llm_models.id |
| profile_id | uuid | NO | — | FK → profiles.id |
| caption_request_id | bigint | NO | — | FK → caption_requests.id |
| llm_system_prompt | text | NO | — | System prompt used |
| llm_user_prompt | text | NO | — | User prompt used |
| llm_temperature | numeric | YES | — | Temperature used |
| humor_flavor_id | bigint | NO | — | FK → humor_flavors.id |
| llm_prompt_chain_id | bigint | YES | — | FK → llm_prompt_chains.id |
| humor_flavor_step_id | bigint | YES | — | FK → humor_flavor_steps.id |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_datetime_utc | timestamptz | NO | now() | |

**Foreign Keys:**
- `llm_model_id` → `llm_models.id`
- `profile_id` → `profiles.id`
- `caption_request_id` → `caption_requests.id`
- `humor_flavor_id` → `humor_flavors.id`
- `llm_prompt_chain_id` → `llm_prompt_chains.id`
- `humor_flavor_step_id` → `humor_flavor_steps.id`

**RLS:** Not enabled

**Used by this app for:** Stores the output of each individual step in a prompt chain execution. Useful for showing intermediate results during testing (Phase 5).

---

### `humor_flavor_mix`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | bigint | NO | — | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| humor_flavor_id | bigint | NO | — | FK → humor_flavors.id |
| caption_count | smallint | NO | — | Number of captions to generate |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_datetime_utc | timestamptz | NO | now() | |

**RLS:** Not enabled

**Used by this app for:** Defines how many captions a flavor should generate in a mix. May be relevant for testing UI.

---

### `humor_themes`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | bigint | NO | — | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| name | varchar | YES | — | Theme name |
| description | text | YES | — | |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_datetime_utc | timestamptz | NO | now() | |

**RLS:** Not enabled

**Used by this app for:** Tags/categories for humor flavors. Linked via `humor_flavor_theme_mappings`. Optional display in flavor detail.

---

### `humor_flavor_theme_mappings`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | bigint | NO | — | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| humor_flavor_id | bigint | YES | — | FK → humor_flavors.id |
| humor_theme_id | bigint | YES | — | FK → humor_themes.id |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_datetime_utc | timestamptz | NO | now() | |

**RLS:** Not enabled

**Used by this app for:** Many-to-many join between humor flavors and humor themes.

---

### `study_image_sets`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | bigint | NO | — | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| modified_datetime_utc | timestamptz | NO | now() | |
| slug | varchar | NO | — | Set name/identifier |
| description | text | YES | — | |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |

**RLS:** Not enabled

**Used by this app for:** Named collections of images for testing. Could be used as test image sets in Phase 5.

---

### `study_image_set_image_mappings`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | bigint | NO | — | PK |
| created_datetime_utc | timestamptz | NO | now() | |
| study_image_set_id | bigint | NO | — | FK → study_image_sets.id |
| image_id | uuid | NO | — | FK → images.id |
| created_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_by_user_id | uuid | NO | auth.uid() | FK → profiles.id |
| modified_datetime_utc | timestamptz | NO | now() | |

**RLS:** Not enabled

**Used by this app for:** Join table linking images to study image sets.

---

### Supabase Storage Buckets

| Bucket | Public | Size Limit | Allowed MIME Types |
|--------|--------|------------|-------------------|
| `images` | Yes | None | None (all allowed) |

Images are stored in the public `images` bucket. Image URLs in the `images` table likely reference this bucket.

---

### REST API: `https://api.almostcrackd.ai`

**Discovery results (Phase 0):**
- The API is behind AWS CloudFront
- Root (`/`) returns 405 "Method post is not allowed on this route" for POST
- Common paths (`/generate`, `/captions`, `/caption`, `/caption-request`, `/api/generate`, `/v1/generate`, etc.) all return 405 for POST
- GET requests to `/health`, `/docs` also return 405
- OPTIONS returns 204 (CORS preflight works)
- Adding `Authorization: Bearer` header does not change the 405 responses
- The API likely uses specific route paths not discoverable without documentation

**Conclusion:** The exact endpoint path and request/response format could not be determined in Phase 0. The Phase 5 agent will need to:
1. Check with the user for API documentation or endpoint details
2. Examine `caption_requests`, `llm_prompt_chains`, and `llm_model_responses` data for clues
3. The DB schema suggests the API takes at minimum: an image_id and runs through a humor flavor's steps, creating `caption_requests` → `llm_prompt_chains` → `llm_model_responses` → `captions`

---

## Phase 1: Auth & Access Control

> **Status: COMPLETE**

### Agent Instructions — Phase 1

```
CONTEXT: You are starting Phase 1 of the Prompt Chain Tool project.
Read IMPLEMENTATION_PLAN.md (especially the "Database Schema" section
added in Phase 0) and CLAUDE.md first.

GOAL: Implement Google OAuth login, the /auth/callback route handler,
auth guard in proxy.ts, admin access check, and logout.
After this phase, a user should be able to:
- See a login page with "Sign in with Google"
- Click it, go through Google OAuth, land back in the app
- Be blocked if they are not a superadmin or matrix_admin
- Log out

FILES YOU WILL CREATE OR MODIFY:
- src/app/login/page.tsx (new — login page, client component)
- src/app/auth/callback/route.ts (new — GET route handler)
- src/app/access-denied/page.tsx (new — static page)
- src/app/page.tsx (modify — redirect to /flavors or /login)
- src/app/layout.tsx (modify — wrap with AuthProvider)
- src/proxy.ts (modify — add auth guard logic)
- src/components/auth/auth-provider.tsx (new — client context)

CRITICAL RULES:
- Read the "UI Design System" section in this plan before writing any
  JSX. Use the exact color classes, button patterns, and input styles
  defined there.
- Google OAuth ONLY. No email/password. No magic link. No other providers.
- The callback route MUST be /auth/callback (route.ts, not page.tsx)
- Use supabase.auth.signInWithOAuth({ provider: 'google' })
- Use supabase.auth.exchangeCodeForSession(code) in the callback
- The login page is a client component ("use client")
- The callback route uses the SERVER supabase client
- proxy.ts should ONLY do session refresh + redirect unauthenticated
  users to /login. Admin check happens in a layout server component.
- Use the EXISTING supabase clients in src/lib/supabase/client.ts
  and src/lib/supabase/server.ts — do not create new ones
- Check the Database Schema section for the exact profiles table
  columns to query for admin access

DO NOT:
- Install new packages (everything needed is installed)
- Create email/password auth
- Put admin logic in proxy.ts
- Create placeholder/stub files for future phases
- Modify globals.css or theme (that's Phase 2)
- Build any flavor/step UI (that's Phase 3-4)

VERIFY WHEN DONE:
1. Run: npm run build — must pass with zero errors
2. Manually check: all new files exist in the right locations
3. Confirm: /auth/callback/route.ts is a route handler (exports GET),
   NOT a page component
4. Confirm: proxy.ts allows /login, /auth/callback, and static assets
   through without auth
```

### Auth System: Google OAuth via Supabase (MANDATORY)

**DO NOT use email/password auth. The ONLY login method is Google OAuth.**

**Prerequisites (done in Supabase Dashboard, NOT in code):**
- Google OAuth Client ID `388960353527-fh4grc6mla425lg0e3g1hh67omtrdihd.apps.googleusercontent.com` must be configured in Supabase Dashboard → Authentication → Providers → Google
- No Google Client Secret is needed
- The Supabase project's auth callback URL (`https://<project-ref>.supabase.co/auth/v1/callback`) must be added as an authorized redirect URI in Google Cloud Console

**Packages (already installed):**
- `@supabase/ssr` — server/browser auth client wiring
- `@supabase/supabase-js` — Auth API calls

### 1.1 Login Page (`/login`)
- [x] Create `/login` route with a "Sign in with Google" button — **no email/password form**
- [x] On button click, call:
  ```ts
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  ```
- [x] Style the page cleanly (centered card, app branding)
- [x] If user is already authenticated, redirect to `/flavors`

### 1.2 Auth Callback Route (`/auth/callback`)
- [x] Create route handler at `src/app/auth/callback/route.ts`
- [x] This is a `GET` route handler (NOT a page component)
- [x] Extract the `code` query parameter from the URL
- [x] Exchange the code for a session:
  ```ts
  const supabase = await createClient(); // server client
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  ```
- [x] On success: redirect to `/flavors`
- [x] On error: redirect to `/login?error=auth_failed`
- [x] **CRITICAL**: The route MUST be exactly `/auth/callback` — no other path, no extra query params in the redirect URI

### 1.3 Auth Guard in `proxy.ts`
- [x] Update `proxy.ts` to check auth state on every request
- [x] If user is NOT authenticated and the path is NOT `/login` or `/auth/callback`, redirect to `/login`
- [x] If user IS authenticated, allow the request through
- [x] Always allow: `/login`, `/auth/callback`, `/_next/*`, `/favicon.ico`, static assets

### 1.4 Admin Access Check
- [x] After successful login, fetch the user's profile from the `profiles` table
- [x] Check: `profiles.is_superadmin === true` OR `profiles.is_matrix_admin === true`
- [x] If NEITHER is true → redirect to `/access-denied` page
- [x] Create `/access-denied` route with a message explaining the user doesn't have admin access
- [x] The admin check should happen in the app layout or a server component, not in proxy.ts (proxy should only handle session refresh + basic auth redirect)

### 1.5 Auth Context (Client-Side)
- [x] Create `AuthProvider` context component wrapping the app
- [x] Expose: `user`, `profile` (with `is_superadmin`, `is_matrix_admin`), `isLoading`, `signOut`
- [x] `signOut` calls `supabase.auth.signOut()` then redirects to `/login`
- [x] Listen for auth state changes via `supabase.auth.onAuthStateChange`
- [x] Add logout button in the app header

### 1.6 Logout
- [x] Call `supabase.auth.signOut()`
- [x] Redirect to `/login`
- [x] Clear any client-side state

---

## Phase 2: Layout & Theme

> **Status: COMPLETE** (light-only theme — no dark mode per user request)

### Agent Instructions — Phase 2

```
CONTEXT: You are starting Phase 2 of the Prompt Chain Tool project.
Read IMPLEMENTATION_PLAN.md and CLAUDE.md first.
Auth (Phase 1) is complete — login, callback, auth guard, admin check,
and AuthProvider all exist and work.

GOAL: Build the app shell (header, nav, main content area) and the
dark/light/system theme toggle. After this phase, the app should have
a polished layout that all future pages render inside.

FILES YOU WILL CREATE OR MODIFY:
- src/components/theme/theme-provider.tsx (new)
- src/components/theme/theme-toggle.tsx (new)
- src/components/ui/button.tsx (new — reusable button with Primary/Secondary/Danger/Icon variants)
- src/components/ui/input.tsx (new — reusable input wrapping design system styles)
- src/components/ui/textarea.tsx (new — reusable textarea with font-mono for prompts)
- src/components/ui/modal.tsx (new — reusable modal/dialog with backdrop)
- src/components/ui/toast.tsx (new — toast notification system, bottom-right, auto-dismiss)
- src/components/ui/skeleton.tsx (new — reusable skeleton loading block)
- src/app/layout.tsx (modify — add ThemeProvider, app shell)
- src/app/globals.css (modify — ensure dark mode variables work)
- src/app/flavors/page.tsx (new — placeholder list page so nav works)

CRITICAL RULES:
- Read the "UI Design System" section in this plan FIRST. It defines
  the exact colors, typography, component patterns, layout structure,
  and spacing you must use. Do not deviate from it.
- Create shared UI components in src/components/ui/ that encapsulate
  the design system patterns. Every button, input, textarea, modal,
  toast, and skeleton in the app MUST use these shared components
  instead of repeating raw Tailwind classes. The components should
  accept standard HTML props plus a `variant` prop where applicable.
  See the new "2.3 Shared UI Components" section below for specs.
- Tailwind CSS v4 — there is NO tailwind.config file. Theme is
  configured via @theme inline in globals.css. Do not create a
  tailwind.config.ts.
- Theme toggle must support THREE modes: light, dark, system default
- Store theme preference in localStorage (not a cookie)
- Apply theme by toggling a class on <html> (e.g., class="dark")
- The layout must include:
  - Header with: app name ("Prompt Chain Tool"), theme toggle,
    user email/name (from AuthProvider), logout button
  - Navigation/sidebar with link to "Humor Flavors" (/flavors)
  - Main content area where child pages render
- The layout should be responsive
- Use the existing AuthProvider from Phase 1 — do not recreate it
- The /flavors page can be a simple placeholder for now
  (just a heading "Humor Flavors" and empty state message)

DO NOT:
- Install UI libraries (no shadcn, no headlessui, no radix) —
  build with plain Tailwind
- Create a tailwind.config.ts file
- Modify the auth system
- Build flavor CRUD (that's Phase 3)
- Over-engineer the UI components — keep them simple

VERIFY WHEN DONE:
1. Run: npm run build — must pass with zero errors
2. Theme toggle cycles through light → dark → system and persists
   across page refreshes
3. The app shell (header, nav, content area) renders on /flavors
4. Logout button works (calls signOut from AuthProvider)
5. No flash of wrong theme on page load (handle SSR/hydration correctly)
```

### 2.1 Theme System (Dark / Light / System)
- [x] ~~Dark mode removed per user request — light-only theme~~
- [x] Cleaned up `globals.css` — removed dark media query, set zinc-50 background

### 2.2 App Shell / Layout
- [x] Created shared layout with:
  - Header: app name, user email, logout button (no theme toggle — light only)
  - Sidebar: nav link to Humor Flavors list
  - Main content area with max-w-4xl
- [x] Responsive design — sidebar collapses to hamburger on mobile

### 2.3 Shared UI Components (`src/components/ui/`)

All components below encapsulate the design system Tailwind classes (light mode only). Future phases MUST import these instead of writing raw Tailwind button/input/modal classes.

- [x] **`button.tsx`** — `<Button variant="primary|secondary|danger|icon" />` with disabled + loading spinner support
- [x] **`input.tsx`** — `<Input />` with label + error support
- [x] **`textarea.tsx`** — `<Textarea />` with font-mono, min-h, label + error support
- [x] **`modal.tsx`** — `<Modal open onClose title>` with backdrop click + ESC to close
- [x] **`toast.tsx`** — `<ToastProvider>` + `useToast()` hook, bottom-right, auto-dismiss 3s, success/error/info variants
- [x] **`skeleton.tsx`** — `<Skeleton className />` with animate-pulse

---

## Phase 3: Humor Flavors CRUD

> **Status: COMPLETE**

### Agent Instructions — Phase 3

```
CONTEXT: You are starting Phase 3 of the Prompt Chain Tool project.
Read IMPLEMENTATION_PLAN.md (especially the "Database Schema" section)
and CLAUDE.md first. Auth (Phase 1) and Layout (Phase 2) are complete.

GOAL: Build full CRUD for humor flavors — list, create, edit, delete.
After this phase, a logged-in admin should be able to create a new
humor flavor, see it in the list, edit its metadata, and delete it.

FILES YOU WILL CREATE OR MODIFY:
- src/app/flavors/page.tsx (modify — real list with data from Supabase)
- src/app/flavors/new/page.tsx (new — create form)
- src/app/flavors/[id]/page.tsx (new — view/edit page)
- src/components/flavors/flavor-form.tsx (new)
- src/components/flavors/flavor-list.tsx (new)
- src/components/flavors/flavor-card.tsx (new)
- src/lib/types.ts (new — TypeScript types for DB tables)

CRITICAL RULES:
- Read the "UI Design System" section in this plan FIRST. Use its
  color classes, button patterns, card styles, input styles, empty
  states, and spacing. Do not invent new patterns.
- Use the shared UI components from src/components/ui/ (Button, Input,
  Textarea, Modal, Toast, Skeleton). Do NOT write raw Tailwind button/
  input/modal classes — always import the shared component.
- Wrap every data-fetching section in <Suspense> with a skeleton
  fallback. The page shell must render immediately while data loads.
- Use the ACTUAL column names from the Database Schema section below.
  Do not guess column names.
- Use the server Supabase client for data fetching in Server Components
- Use the browser Supabase client for mutations in Client Components
- Forms should validate required fields before submitting
- Delete must have a confirmation dialog (window.confirm is fine)
- After create → redirect to the new flavor's detail page
- After delete → redirect to /flavors list
- The flavor detail page (/flavors/[id]) should show the flavor info
  AND a section for steps (but steps CRUD is Phase 4 — just show an
  empty state "No steps yet" placeholder)
- Handle loading and error states
- Use the types from src/lib/types.ts everywhere — define them based
  on the actual DB schema

DO NOT:
- Implement step CRUD (Phase 4)
- Implement caption generation (Phase 5)
- Install new packages
- Modify auth or layout code unless necessary
- Create API routes for CRUD — use Supabase client directly

VERIFY WHEN DONE:
1. Run: npm run build — must pass with zero errors
2. /flavors shows list of flavors from the database (or empty state)
3. /flavors/new form creates a real record in Supabase
4. /flavors/[id] loads and displays a real flavor
5. Edit saves changes to Supabase
6. Delete removes the record and redirects to /flavors
7. TypeScript types match the actual database schema
```

### 3.1 List Page (`/flavors`)
- [x] Fetch all humor flavors from Supabase with step counts
- [x] Display as card list with name, description, step count, created date
- [x] "New Flavor" button links to /flavors/new
- [x] Click a flavor to go to its detail/edit page
- [x] Delete button with confirmation modal
- [x] Suspense boundary with skeleton fallback
- [x] Empty state with CTA

### 3.2 Create Flavor (`/flavors/new`)
- [x] Form with slug (name) and description fields
- [x] Client-side validation (name required)
- [x] Insert into Supabase via browser client
- [x] Redirect to the new flavor's detail page on success

### 3.3 Edit Flavor (`/flavors/[id]`)
- [x] Load flavor via server component with Suspense
- [x] Editable slug and description fields (reuses FlavorForm)
- [x] Save changes to Supabase
- [x] Delete button with confirmation modal → redirects to /flavors
- [x] Steps section with "No steps yet" placeholder (Phase 4)

---

## Phase 4: Humor Flavor Steps CRUD & Reorder

> **Status: COMPLETE**

### Agent Instructions — Phase 4

```
CONTEXT: You are starting Phase 4 of the Prompt Chain Tool project.
Read IMPLEMENTATION_PLAN.md (especially the "Database Schema" section
and the "Core Concept: Prompt Chain" section) and CLAUDE.md first.
Auth (Phase 1), Layout (Phase 2), and Flavor CRUD (Phase 3) are complete.

GOAL: Build full CRUD for humor flavor steps within a flavor, plus
reordering. After this phase, a user should be able to add steps to a
flavor, edit them, delete them, and reorder them. The UI should clearly
show the prompt chain flow.

FILES YOU WILL CREATE OR MODIFY:
- src/app/flavors/[id]/page.tsx (modify — add steps section)
- src/components/steps/step-form.tsx (new)
- src/components/steps/step-list.tsx (new)
- src/components/steps/step-item.tsx (new)
- src/lib/types.ts (modify — add step types if not already there)

CRITICAL RULES:
- Read the "UI Design System" section in this plan FIRST. Use its
  color classes, button patterns, card styles, and spacing throughout.
- Use the shared UI components from src/components/ui/ (Button, Input,
  Textarea, Modal, Toast, Skeleton). Do NOT write raw Tailwind button/
  input/modal classes — always import the shared component.
- Wrap data-fetching sections in <Suspense> with skeleton fallbacks.
- Steps belong to a flavor. Use the actual foreign key column name
  from the Database Schema section.
- Steps have an ORDER. Use the actual ordering column from the schema.
- The steps UI lives INSIDE the flavor detail page (/flavors/[id]),
  not on a separate route.
- The UI must visually communicate the CHAIN:
  - Step 1 label: "Takes image as input"
  - Step 2+ label: "Takes output from Step N-1"
  - Show arrows or visual connectors between steps
- Reorder: implement up/down arrow buttons (simpler than drag-drop,
  less likely to have bugs). When a step moves, update the order
  column for all affected steps in a single operation.
- After deleting a step, re-normalize order values (no gaps).
- Add/edit step can be inline or modal — pick one and be consistent.
- New steps default to the end of the chain.

DO NOT:
- Implement drag-and-drop (up/down buttons are sufficient and simpler)
- Create a separate route for steps — they live on /flavors/[id]
- Implement caption generation (Phase 5)
- Install new packages (e.g., no dnd-kit)
- Modify auth, layout, or flavor CRUD code unless necessary

VERIFY WHEN DONE:
1. Run: npm run build — must pass with zero errors
2. On /flavors/[id], steps are displayed in order
3. "Add Step" creates a new step at the end of the chain
4. Editing a step saves changes to Supabase
5. Deleting a step removes it and re-normalizes order
6. Up/down arrows reorder steps correctly
7. Step 1 is visually labeled as "image input"
8. Steps 2+ show "receives output from step N-1"
9. Order persists across page refreshes (saved to DB, not just local)
```

### 4.1 Steps List (within `/flavors/[id]`)
- [x] Display all steps for a flavor, ordered by their `order_by` column
- [x] Each step shows: order number, description, model name, prompts preview, input/output type, temperature
- [x] Visually indicate the chain flow: step 1 "Takes image as input", subsequent steps "Takes output from Step N-1"
- [x] Show arrow connectors between steps to communicate the chain

### 4.2 Create Step
- [x] "Add Step" button opens a modal form
- [x] Fields: description, step type, LLM model (grouped by provider), input type, output type, system prompt, user prompt, temperature
- [x] New steps default to the end of the list
- [x] Insert into Supabase with correct `order_by`

### 4.3 Edit Step
- [x] Click edit icon on a step to edit in modal (reuses StepForm)
- [x] Update all step fields
- [x] Save to Supabase

### 4.4 Delete Step
- [x] Delete button with confirmation modal
- [x] After deletion, re-normalize the `order_by` of remaining steps (no gaps)

### 4.5 Reorder Steps
- [x] Up/down arrow buttons to move steps
- [x] Update `order_by` values in Supabase after reorder (swap values)
- [x] Optimistic UI update

---

## Phase 5: Caption Generation & Testing

> **Status: COMPLETE**

### Agent Instructions — Phase 5

```
CONTEXT: You are starting Phase 5 of the Prompt Chain Tool project.
Read IMPLEMENTATION_PLAN.md (especially "Database Schema" and
"Core Concept: Prompt Chain") and CLAUDE.md first.
Phases 1-4 are complete — auth, layout, flavor CRUD, and step CRUD
all work.

GOAL: Build the testing UI where users can run a humor flavor against
test images using the REST API, and view previously generated captions.

THE REST API:
- Base URL: https://api.almostcrackd.ai
- Method: POST
- This is the staging API from Assignment 5
- It generates captions by running a humor flavor's prompt chain
  against an image
- Auth: use the user's Supabase session token as a Bearer token
- Check the "REST API" subsection in Phase 0 and the "Database Schema
  (Discovered)" section for any additional details discovered earlier.
  If the exact endpoint path or request/response format was not fully
  documented in Phase 0, you will need to investigate:
  1. Check if there are any API-related tables in the DB (e.g., logs,
     requests) that reveal the endpoint structure
  2. Try a test POST to https://api.almostcrackd.ai with the user's
     Bearer token to see what it returns (error messages often reveal
     the expected format)
  3. Check if the DB schema gives clues (e.g., a captions table with
     columns like humor_flavor_id, image_url suggests the API takes
     those as inputs)

FILES YOU WILL CREATE OR MODIFY:
- src/app/flavors/[id]/test/page.tsx (new — testing UI)
- src/app/flavors/[id]/page.tsx (modify — add caption history section)
- src/app/api/generate/route.ts (new — server-side proxy to the REST API)
- src/lib/api.ts (new — client-side helper to call our /api/generate route)
- src/lib/types.ts (modify — add caption/test image types)

CRITICAL RULES:
- Use the shared UI components from src/components/ui/ (Button, Input,
  Textarea, Modal, Toast, Skeleton). Do NOT write raw Tailwind button/
  input/modal classes — always import the shared component.
- The REST API is a POST to https://api.almostcrackd.ai — do NOT use
  GET or any other method.
- API calls MUST go through a Next.js API route (src/app/api/generate/route.ts)
  to avoid CORS issues. The browser calls OUR /api/generate route,
  which forwards the request to https://api.almostcrackd.ai.
- The server-side proxy route should:
  1. Get the user's Supabase session token from cookies
  2. Forward it as Authorization: Bearer <token> to the REST API
  3. Pass through the request body (flavor ID, image, etc.)
  4. Return the API response to the client
- Image test set: check the Database Schema section to see how test
  images are stored. Display them as a selectable grid. If no test
  set table exists, support image URL input as fallback.
- The test page shows:
  1. Image selection (from test set or URL input)
  2. A "Generate Captions" button
  3. Results area showing generated captions
  4. Optionally: intermediate step outputs if the API returns them
- Caption history: on the flavor detail page (/flavors/[id]), add a
  section showing previously generated captions for this flavor.
  Show the source image, captions, and timestamp.
- Handle loading states, errors, and empty states using the patterns
  from the "UI Design System" section.
- Wrap data-fetching sections in <Suspense> with skeleton fallbacks.
- Use the button, card, and input patterns from the design system.

DO NOT:
- Call https://api.almostcrackd.ai directly from the browser
- Use GET for the REST API — it's a POST endpoint
- Modify auth, layout, flavor CRUD, or step CRUD code unless necessary
- Hardcode API responses for testing — use real API calls

VERIFY WHEN DONE:
1. Run: npm run build — must pass with zero errors
2. /flavors/[id]/test shows the image test set or URL input
3. Clicking "Generate Captions" calls /api/generate → REST API and shows results
4. /flavors/[id] shows caption history for that flavor
5. Loading and error states are handled
6. API calls go through src/app/api/generate/route.ts (no direct browser→API calls)
```

### 5.1 REST API Integration
- [x] Create server-side proxy at `src/app/api/generate/route.ts` (POST handler)
- [x] Proxy forwards requests to `POST https://api.almostcrackd.ai` with user's Bearer token
- [x] Determine exact request body format (flavor ID? image URL? test with real requests)
- [x] Handle and parse the API response format

### 5.2 Image Test Set
- [x] Discover how test images are stored (DB table? storage bucket? URLs?) during Phase 0
- [x] Display available test images as a selectable grid/list
- [x] Allow selecting one or more images from the test set to run through the flavor
- [x] If no predefined test set exists in the DB, support image upload as a fallback

### 5.3 Test Flavor UI (`/flavors/[id]/test`)
- [x] Show the image test set (from 5.2) for the user to select images
- [x] "Generate Captions" button that calls the REST API with the selected image(s) and the current flavor
- [x] Display generated captions in the UI
- [x] Show step-by-step intermediate results if the API provides them (step 1 output, step 2 output, final captions)
- [x] Loading/progress state during generation

### 5.4 Caption History / Read Captions
- [x] Display previously generated captions for a specific humor flavor
- [x] This should be accessible from the flavor detail page (`/flavors/[id]`) — not buried in a separate route
- [x] Fetch from DB (captions table) filtered by flavor ID
- [x] Show: the source image, generated captions, timestamp, which flavor/steps produced them

---

## Phase 6: Polish & Edge Cases

> **Status: COMPLETE**

### Agent Instructions — Phase 6

```
CONTEXT: You are starting Phase 6 of the Prompt Chain Tool project.
Read IMPLEMENTATION_PLAN.md and CLAUDE.md first.
All features (Phases 1-5) are complete and working.

GOAL: Polish the app — error handling, loading states, empty states,
form validation, responsive design, and small UX improvements.
Do NOT add new features.

IMPORTANT: Use the shared UI components from src/components/ui/
(Button, Input, Textarea, Modal, Toast, Skeleton) throughout. Do NOT
write raw Tailwind button/input/modal classes — always import the
shared component.

TASKS:
1. Add error boundaries at the layout level
2. Add loading skeletons/spinners for all data-fetching pages
3. Add toast notifications for CRUD success/failure
4. Add form validation (required fields, character limits)
5. Ensure all delete actions have confirmation dialogs
6. Add empty state messages:
   - No flavors yet → show a message with link to create one
   - No steps yet → show a message with "Add Step" prompt
   - No captions yet → show a message
7. Do a responsive design pass:
   - Mobile: sidebar collapses, forms stack vertically
   - Test at 375px, 768px, 1024px widths
8. Test dark mode on every page — ensure no hard-coded colors that
   break in dark mode
9. Run npm run build and npm run lint — fix all errors and warnings

DO NOT:
- Add new features
- Refactor working code for style preferences
- Install new packages
- Change the auth flow
- Modify the database schema

VERIFY WHEN DONE:
1. npm run build — zero errors
2. npm run lint — zero warnings
3. Every page has a loading state
4. Every page has an error state
5. Every empty list has an empty state message
6. Theme works on every page in both light and dark mode
7. App is usable on mobile (375px width)
```

- [x] Error boundaries and error states
- [x] Loading skeletons / spinners
- [x] Toast notifications for CRUD operations
- [x] Form validation
- [x] Confirm dialogs for destructive actions (delete flavor, delete step)
- [x] Empty states (no flavors, no steps, no captions)
- [x] Responsive design pass

---

## File Structure (Planned)

```
src/
├── app/
│   ├── layout.tsx              # Root layout with ThemeProvider, AuthProvider
│   ├── page.tsx                # Redirect to /flavors or /login
│   ├── login/
│   │   └── page.tsx            # Login page (Google OAuth button ONLY, no email/password)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts        # GET route handler — exchanges OAuth code for session
│   ├── access-denied/
│   │   └── page.tsx            # Unauthorized users (not superadmin/matrix_admin)
│   ├── api/
│   │   └── generate/
│   │       └── route.ts        # POST handler — proxies to https://api.almostcrackd.ai
│   └── flavors/
│       ├── page.tsx            # List all flavors
│       ├── new/
│       │   └── page.tsx        # Create flavor form
│       └── [id]/
│           ├── page.tsx        # View/edit flavor + manage steps + caption history
│           └── test/
│               └── page.tsx    # Test flavor with image test set
├── components/
│   ├── auth/
│   │   └── auth-provider.tsx
│   ├── theme/
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── flavors/
│   │   ├── flavor-form.tsx
│   │   ├── flavor-list.tsx
│   │   └── flavor-card.tsx
│   ├── steps/
│   │   ├── step-form.tsx
│   │   ├── step-list.tsx
│   │   └── step-item.tsx
│   └── ui/
│       ├── button.tsx         # Shared button (primary/secondary/danger/icon variants)
│       ├── input.tsx          # Shared input with design system styles
│       ├── textarea.tsx       # Shared textarea (font-mono for prompts)
│       ├── modal.tsx          # Shared modal/dialog with backdrop
│       ├── toast.tsx          # Toast notification system (auto-dismiss)
│       └── skeleton.tsx       # Skeleton loading placeholder
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client (exists)
│   │   └── server.ts           # Server client (exists)
│   ├── api.ts                  # REST API client for api.almostcrackd.ai
│   └── types.ts                # TypeScript types matching DB schema
└── proxy.ts                    # Auth guard + session refresh (exists)
```

---

## Key Decisions (Answered After DB Discovery)

1. **What columns exist on `humor_flavors`?** — `id` (bigint PK), `slug` (varchar, NOT NULL — this is the display name), `description` (text, nullable), plus audit columns. Form fields: slug (required), description (optional).

2. **How is step ordering stored?** — `humor_flavor_steps.order_by` (smallint, NOT NULL). Reorder by swapping `order_by` values. Re-normalize after deletes to avoid gaps.

3. **How do steps reference their chain position?** — Each step has `llm_input_type_id`: id=1 is "image-and-text" (for step 1), id=2 is "text-only" (for subsequent steps). The `humor_flavor_step_type_id` further classifies: 1=celebrity-recognition, 2=image-description, 3=general. So the DB **does** explicitly encode whether a step takes image vs text input.

4. **What does the REST API expect?** — Could not be determined in Phase 0. All tested endpoints returned 405. The DB schema suggests the flow: create `caption_request` (user + image) → create `llm_prompt_chain` → execute steps creating `llm_model_responses` → create `captions`. Phase 5 agent must investigate further.

5. **Where is the image test set?** — Two options: (a) `images` table where `is_common_use = true` — common/stock images available to all users, or (b) `study_image_sets` + `study_image_set_image_mappings` — named collections of images. Use `is_common_use` images as the primary test set; `study_image_sets` as an optional secondary source. Images are stored in the public `images` Supabase storage bucket.

6. **How are generated captions stored?** — `captions` table with `content` (the caption text), linked to `humor_flavor_id`, `image_id`, `profile_id`, `caption_request_id`, and `llm_prompt_chain_id`. Step-level outputs are in `llm_model_responses` with `humor_flavor_step_id` for per-step results.

7. **What RLS policies exist?** — Only `profiles` and `images` have RLS enabled. All other tables (including `humor_flavors`, `humor_flavor_steps`, `captions`) have RLS **disabled** — the anon key can read/write freely. The app should still use authenticated queries, but no additional server-side RLS workarounds are needed for flavor/step CRUD.

---

## Next Step

**Phase 1: Implement Google OAuth login, auth callback, auth guard, admin access check, and logout.**
