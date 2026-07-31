# AGENTS

Coding rules for anyone (human or AI) working on this repo, current as of
Phase 4.

## Verification (this sandbox has no network egress)
- Cannot run `next build` (fails fetching the SWC binary) or
  `prisma generate`/`migrate` (fails fetching the query engine). Neither
  is a code defect when it happens here — note it and move on.
- Always run instead: `npx tsc --noEmit` on both frontend and backend, plus
  a manual brace/bracket/paren balance check on every edited file before
  calling something done.
- If `tsc` shows an error whose root cause is a schema field not yet in
  the generated Prisma client (a pre-existing gap from before this
  initiative), say so explicitly rather than treating it as new breakage.
- For a real unused-import/variable check, temporarily enable
  `noUnusedLocals`/`noUnusedParameters` in tsconfig, run `tsc --noEmit`,
  then revert the config change — don't leave it enabled without checking
  it doesn't break the existing build setup.
- Don't trust a raw `grep -c` for counting data entries (e.g. "how many
  provinces") — it can match unrelated occurrences (type field names,
  comments) and mislead. Parse the actual data structure with a script
  and verify uniqueness explicitly, the way Phase 7 re-verified the
  77-province count after an initial grep gave a wrong-looking 81.
- Anything that requires a live browser (hydration warnings, real
  cross-origin cookie behavior, actual visual overlap at a given
  viewport) cannot be verified here — say "NOT VERIFIED", not "Pass".
  See HANDOFF.md's Phase 7 audit for the format this takes.
- `useSearchParams()` in the Next.js App Router requires the calling
  component to be wrapped in `<Suspense>` — forgetting this either breaks
  the build or silently opts the route out of static optimization. If a
  page hands off state via URL query params (see ARCHITECTURE.md), the
  receiving page needs both the `useSearchParams()` read AND the
  `<Suspense>` wrapper, not just one.

## Scope discipline
- Don't redesign pages/components outside the current phase's stated
  scope, even if you notice similar bugs elsewhere (log them in
  HANDOFF.md's "Remaining tasks" instead — see e.g. SeekerNavbar/
  AdminNavbar's missing mobile nav, flagged but not fixed in Phase 4).
- Don't invent new pages/routes to satisfy a menu item — if the ideal
  target page doesn't exist, point at the closest real page and document
  the substitution (see "Account Settings" / "Applications" in HANDOFF.md).
- No commits, no `git push`, unless explicitly asked.

## Shared config over duplicated lists
When the same set of links/items needs to appear in more than one place
(desktop nav vs. mobile drawer, dropdown vs. mobile panel), define it once
and import it into both. Never hand-maintain two lists that are supposed
to stay identical — see `EMPLOYER_NAV_ITEMS` (layout/index.tsx) and
`SEEKER_MENU_ITEMS`/`EMPLOYER_MENU_ITEMS`/`ADMIN_MENU_ITEMS`
(components/home/MemberMenu.tsx) for the established pattern.

## Large external datasets
`bash_tool` has no network access (domain-allowlist blocks it); `web_fetch`
does, but pulling a large dataset (Phase 5: ~930 districts, ~7,452
subdistricts) through it record-by-record burns enormous context for
data the user can download directly in seconds. When a real dataset is
too big to fetch through chat cleanly: fetch the small/critical tier
yourself if it fits, then stop and ask the user to upload the rest rather
than continuing to force it through an expensive path. Once uploaded,
verify it (counts, uniqueness, referential integrity, known edge cases
like Bangkok's exact name) before trusting it — see `lib/thai-locations.ts`
generation script output in the Phase 5 session for the shape of that
verification.

## Brand
- Logo: always `frontend/src/components/brand/Logo.tsx`, never a raw
  `<img>`/text badge. Alt text is always `"JobBoard Home"`. Always links
  via `next/link` — a full-page `<a href="/">` reload is exactly the bug
  Phase 2 had to fix once already.
- Color: prefer the `navy` / `brandOrange` Tailwind tokens for anything
  logo-adjacent or newly touched. Don't mass-replace the pre-existing
  `indigo`/`primary` classes on untouched pages — that's a redesign, not
  a fix.
- Touch targets: use the `min-h-touch`/`min-w-touch` (44px) utilities on
  any new interactive mobile element.

## End-of-response checklist
Every response in this initiative must, before finishing:
1. Update `PROJECT_PLAN.md` (phase status table).
2. Update `HANDOFF.md` (current phase, completed/remaining tasks, files
   modified, commands to run, known bugs, next recommended task).
3. Update `CHANGELOG.md` (append a new dated/phased entry — never rewrite
   history).
4. Update `ARCHITECTURE.md` only if something structural changed (a new
   global provider, a new shared pattern, a changed data flow) — not for
   routine UI tweaks.
5. Keep this file (`AGENTS.md`) in sync if a new rule/convention was
   established during the response.
