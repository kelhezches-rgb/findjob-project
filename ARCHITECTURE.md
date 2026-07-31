# ARCHITECTURE

High-level reference for the JobBoard app. See CLAUDE.md (project root)
for the full original architecture writeup — this file only documents
what changed during the branding/production-readiness initiative.

## Stack
- Frontend: Next.js (App Router) + TypeScript + Tailwind, Zustand for
  client auth state, Axios for API calls.
- Backend: Express + Prisma + PostgreSQL, JWT access (in-memory) +
  refresh (httpOnly cookie) tokens.

## Auth flow (as of Phase 2)
```
App boot (real page load)
  └─ AuthProvider (mounted once, in app/layout.tsx)
       ├─ if accessToken already in memory → done, isLoading=false
       └─ else → POST /auth/refresh (cookie-based)
                   ├─ success → GET /auth/me → setAuth(user, token)
                   └─ fail
                        ├─ confirmed response (401/403) → clearAuth()
                        └─ no response (network/CORS) → just stop loading,
                           DON'T assert logged-out

Every subsequent request (via lib/api.ts axios instance)
  └─ response interceptor: on 401 → single in-flight refresh (queued),
     retries the original request once refreshed; same confirmed-vs-
     ambiguous-error distinction as above before clearing auth.
```
`useAuth()` (hooks/useAuth.ts) is the single public entry point every
component uses — it no longer runs its own restore effect (that caused
duplicate concurrent refresh calls); it just reads/writes the shared
Zustand store and exposes `login`/`register`/`logout`.

**Cross-origin requirement:** the refresh-token cookie must be
`sameSite: 'none'` + `secure: true` in production because the deployed
frontend (Vercel) and backend (Render) are different registrable domains
— `sameSite: 'lax'` silently drops the cookie on cross-site XHR/fetch.
Local dev keeps `sameSite: 'lax'` since `localhost:3000`/`:5000` are
same-site.

## Brand system (Phase 1)
- Single source of truth: `frontend/src/components/brand/Logo.tsx`.
  `variant="icon"` (compact, navbars) or `variant="lockup"` (icon+wordmark,
  auth screens/footer). Always wraps `next/link` — never a raw `<a>`.
- Color tokens: `navy` and `brandOrange` in `tailwind.config.ts`, sampled
  from the mascot artwork. Pre-existing `primary` (indigo) scale kept
  as-is for pages not touched by this initiative.

## Navigation configuration pattern (Phases 3–4)
Both `MemberMenu` (home header, role-aware) and `EmployerNavbar` (employer
dashboard) follow the same rule: **one array of `{ href, label, icon }`
per role/context, rendered by both the desktop UI and the mobile UI** —
never two independently-maintained lists. When adding a nav item, add it
to the shared array; both surfaces update automatically.

Known gap: `SeekerNavbar` and `AdminNavbar` still only render nav on
`md:` and up, with no mobile fallback (same class of bug Phase 4 fixed
for `EmployerNavbar`). Not yet fixed — no phase has targeted them.

## Large static reference datasets (Phase 5)
Pattern established for the Thailand location data, reusable for any
future large-but-static reference dataset:
- Split by size/access-frequency: the small, always-needed tier (77
  provinces) is embedded directly in a `.ts` module — zero network
  round-trip. The large, conditionally-needed tiers (930 districts, 7,452
  subdistricts) live as static JSON under `frontend/public/data/` and are
  fetched lazily (only once a parent selection makes them relevant) and
  cached at module scope so they're fetched at most once per page load,
  never re-fetched, and never bundled into the JS bundle itself.
- Data access is fully separated from UI: `lib/thai-locations.ts` exports
  typed data + lookup functions only; `components/ui/SearchableSelect.tsx`
  is a generic, dataset-agnostic dropdown primitive; `components/location/
  ThaiLocationPicker.tsx` is the only place that knows about "province/
  district/subdistrict" as a concept.
- IDs are the real identifiers (`Province.id`, `District.id`,
  `SubDistrict.id` from the source dataset) — display names are derived,
  never the other way around. Components that only round-trip *names*
  through non-ID-aware state (e.g. `JobFilters`, which mirrors URL query
  params) own a local ID-aware shadow state and reverse-lookup by name to
  restore it, rather than losing the ID entirely.

**Job's location filter is still free text.** `Job.province`/`Job.location`
are unchanged, unindexed-by-ID text columns — the new picker's IDs never
reach the database; only the resolved Thai names do, through the same
`province`/(new) `district`/`subDistrict` string query params. Province
filtering is therefore exact (matches the `province` column); district/
subdistrict filtering is a best-effort text search against `location` (see
CHANGELOG.md Phase 5, and HANDOFF.md "Remaining tasks" for the schema
change that would make it exact).

## Home-page-search → results-page handoff (Phase 5, bug fixed in Phase 7)
`Hero.tsx` hands search params to `/jobs` via `router.push('/jobs?q=..&province=..')`
(a real URL navigation, not client state). `/jobs/page.tsx` must therefore
read `useSearchParams()` on mount to seed its filter state — it didn't,
until Phase 7's audit caught it. Any future page that receives a search
handoff this way needs the same pattern:
`useState<Filters>(() => filtersFromSearchParams(useSearchParams()))`, with
the component wrapped in `<Suspense>` — Next.js App Router requires
`useSearchParams()` to be inside a Suspense boundary, so `/jobs/page.tsx`
now exports a thin `<Suspense>` wrapper around the real page component.
