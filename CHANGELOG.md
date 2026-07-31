# CHANGELOG

## Phase 7 — Final audit of Phases 1–6
Static code audit (no live browser available in this sandbox — see
HANDOFF.md for exactly what was/wasn't verifiable). Found and fixed two
real bugs directly tied to these phases:

- **Fixed (Critical):** `/jobs` page never read the `?q=`/`?province=`/etc.
  query params that the home page's search bar (`Hero.tsx`, Phase 5) hands
  off via `router.push('/jobs?...')` — it always started from a hardcoded
  `{ page: 1 }`. A home-page search landed on `/jobs` showing the
  *unfiltered* full list. Fixed by seeding initial filters from
  `useSearchParams()`; wrapped the page in `<Suspense>` per Next.js's
  requirement for that hook.
- **Fixed (Medium, hardening):** `auth.controller.ts`'s `logout` cleared
  the refresh-token cookie with only `{ path }`, not matching
  `secure`/`sameSite`. Some browsers won't reliably clear a
  `Secure; SameSite=None` cookie unless the clearing response also sets
  those attributes — could leave a "successful" logout with the cookie
  still alive server-side-visible. Now matches the same `COOKIE` config
  used to set it.
- **Confirmed via inspection, not fixed (documented, Medium):**
  district/subdistrict job filtering (Phase 5) has low real-world recall
  — `Job.location` is an optional free-text field on the job posting form
  (placeholder example: "อาคาร X ชั้น Y"), so most postings won't
  literally contain the district/subdistrict name for the `contains`
  match to find. Province filtering is unaffected (exact match on its own
  column).
- Everything else audited (logo/branding, auth persistence architecture,
  member menu role-gating, employer mobile nav completeness, 77-province
  dataset integrity, salary-filter absence on home page, back-to-top
  positioning) checked out — see HANDOFF.md for the full Pass/Fail table.
- Files touched: `frontend/src/app/jobs/page.tsx`,
  `backend/src/modules/auth/auth.controller.ts`

## Phase 6 — Home page: salary filter removal + Back-to-Top
- **Audited:** home page search section (Hero.tsx) for a salary filter to
  remove. Found none — post-Phase-5, Hero's search bar only ever had
  keyword (`q`) and province fields, no salary input/state/query param
  existed there to begin with. No dead code, no rebalancing needed.
- **Confirmed untouched (by design):** salary *display* on FeaturedJobs/
  LatestJobs mock cards, `salaryLabel` in `mockData.ts`, salary fields on
  the job posting form, job detail page, and `/jobs` search page (`sort`
  by salary, `salaryMin`/`salaryMax` query params) — all still intact,
  none of that lives in the home-page search section this phase targeted.
- **Added:** `<BackToTop>` — floating button, bottom-right, `fixed`,
  appears once `window.scrollY > 400`, smooth `window.scrollTo`, navy
  background with an orange focus ring, `aria-label="กลับขึ้นด้านบน"`,
  native `<button>` so keyboard access (Tab + Enter/Space) works with no
  extra code, `z-30` — deliberately below the header (`z-40`) and any
  modal/drawer (`z-50`/`z-60`) so it can never visually cover them.
  Mounted only on the home page (`app/page.tsx`), per this phase's scope.
- Files: `frontend/src/components/home/BackToTop.tsx` (new),
  `frontend/src/app/page.tsx`

## Phase 5 — Thailand location selector
- **Added:** real Thailand administrative-division dataset — 77 provinces,
  930 districts, 7,452 subdistricts (source: `kongvut/thai-province-data`,
  MIT-licensed; user uploaded the JSON, verified: 77 provinces exactly, all
  IDs unique, zero orphan districts/subdistricts, Bangkok normalized as
  กรุงเทพมหานคร). Trimmed and split into `/public/data/thai-locations/`.
- **Added:** `lib/thai-locations.ts` — provinces embedded directly (instant,
  no fetch — it's the primary field), districts/subdistricts lazily fetched
  once from static JSON and memoized module-level (never re-fetched, never
  a third-party API call).
- **Added:** `SearchableSelect` — generic text-filterable, keyboard
  navigable dropdown primitive (viewport-bounded, capped popover height).
- **Added:** `ThaiLocationPicker` — cascading province→district→subdistrict
  built on `SearchableSelect`; selecting/clearing a province always resets
  district+subdistrict, selecting/clearing a district always resets
  subdistrict; includes a reset-all control.
- **Changed:** home hero's free-text "จังหวัด" input → province-only
  `SearchableSelect` (77 real provinces, searchable).
- **Changed:** `/jobs` results page's free-text location input → full
  `ThaiLocationPicker` (province + optional district + optional
  subdistrict).
- **Changed (backend, no schema change):** `jobQuerySchema` gained optional
  `district`/`subDistrict` params. `province` filtering is exact (matches
  the existing `Job.province` column); district/subdistrict are graded as
  a **best-effort** `contains` match against the existing `Job.location`
  free-text field, since `Job` has no dedicated district/subdistrict
  columns — documented as a limitation rather than silently pretending
  it's exact (a real schema change would be needed for that; not applied
  without checking first, per this phase's instructions).
- Files: `frontend/public/data/thai-locations/*.json` (new),
  `frontend/src/lib/thai-locations.ts` (new),
  `frontend/src/components/ui/SearchableSelect.tsx` (new),
  `frontend/src/components/location/ThaiLocationPicker.tsx` (new),
  `frontend/src/components/home/Hero.tsx`,
  `frontend/src/components/jobs/JobSearchBar.tsx`,
  `frontend/src/hooks/index.ts`,
  `backend/src/validators/index.ts`,
  `backend/src/modules/jobs/job.service.ts`

## Phase 4 — Employer dashboard mobile navigation
- **Fixed:** `EmployerNavbar` had zero navigation on mobile (`hidden md:flex`
  with no fallback) — Dashboard, Company, Manage Jobs were all
  inaccessible below the `md` breakpoint.
- **Added:** full-screen mobile drawer (hamburger → slide-in panel from the
  right, backdrop click / Escape / route-change all close it, close button,
  background scroll lock).
- **Added:** `EMPLOYER_NAV_ITEMS` — one shared config (icon+href+label) now
  powering both the desktop bar and the mobile drawer, so they can't drift.
  Expanded to include two items that were missing from *desktop* nav too:
  "ลงประกาศงาน" (Post a Job → `/employer/jobs/create`) and "ใบสมัครงาน"
  (Applications → `/employer/jobs`, nearest existing page).
- **Fixed:** long company names could overflow the header — added `truncate`
  + `max-w` to the company-name label in both desktop bar and drawer.
- Active route now highlighted with the `navy` brand token (was `indigo`).
- All interactive elements sized to the `min-h-touch`/`min-w-touch` (44px)
  utility introduced in an earlier phase.
- Files: `frontend/src/components/layout/index.tsx`

## Phase 3 — Role-aware member menu
- **Added:** `MemberMenu` component — dropdown on the home header showing
  role-specific items (seeker / employer / admin), sourced entirely from
  the existing `useAuth()` store (no second auth state).
- Keyboard accessible: `role="menu"`/`"menuitem"`, Escape closes and
  returns focus, click-outside closes.
- Mobile hamburger panel on the home page now renders the exact same
  per-role item arrays exported by `MemberMenu`, plus a logout action.
- Files: `frontend/src/components/home/MemberMenu.tsx` (new),
  `frontend/src/components/home/HomeNavbar.tsx`

## Phase 2 — Auth persistence fix
- **Root cause found:** refresh-token cookie was `sameSite: 'lax'`, which
  browsers refuse to attach to cross-site XHR/fetch (Vercel frontend ↔
  Render backend are different registrable domains). This is what caused
  permanent logout in production once the in-memory access token was gone.
- **Fixed:** `sameSite: 'none'` in production (paired with the `secure`
  flag already conditional on `NODE_ENV==='production'`).
- **Fixed:** auth restore used to run once per component calling
  `useAuth()` (duplicate concurrent `/auth/refresh` calls on every page
  load). Centralized into one `AuthProvider`, mounted once in root layout.
- **Fixed:** both the restore flow and the axios interceptor used to call
  `clearAuth()` on *any* error, including ambiguous network failures with
  no server response. Now only a confirmed 401/403 response clears auth.
- **Fixed:** interceptor's dead-end redirect pointed at `/login` (route
  doesn't exist) — corrected to `/auth/login`.
- **Added:** loading-state skeleton on the home header so it doesn't flash
  the logged-out (Login/Register) buttons while restoring.
- Files: `backend/src/modules/auth/auth.controller.ts`,
  `frontend/src/components/auth/AuthProvider.tsx` (new),
  `frontend/src/hooks/useAuth.ts`, `frontend/src/app/layout.tsx`,
  `frontend/src/lib/api.ts`, `frontend/src/components/home/HomeNavbar.tsx`

## Phase 1 — Brand system & mascot logo
- **Added:** official mascot logo, cropped into 3 transparent-background
  assets (icon-only, wordmark w/o tagline, full lockup) under
  `frontend/public/brand/`.
- **Added:** reusable `<Logo>` component (`next/image` + `next/link`,
  fixed `alt="JobBoard Home"`, no full page reload).
- Replaced placeholder "J" badge logos in: main header, seeker navbar,
  employer navbar, login page, register page, footer.
- Logo now links to `/` everywhere (previously `/jobs` on seeker nav,
  `/employer/dashboard` on employer nav).
- **Added:** `navy` and `brandOrange` Tailwind color scales, sampled
  directly from the logo artwork.
- Files: see HANDOFF.md file list.
