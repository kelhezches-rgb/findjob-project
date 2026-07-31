# JobBoard — Project Plan

## Current initiative: Branding & Production Readiness (Phases 1–7+)

Requested by the user as a sequenced set of phases (1–6, executed
back-to-back; Phase 7 held until explicitly requested — **all of 1–6 are
now complete, waiting for the go-ahead on Phase 7**). Builds on top of the
earlier Phase 1–11 feature work (categories, saved jobs, sort, company
profiles, quick-view modal, apply flow, community section, footer socials,
initial production-readiness pass) documented in CHANGELOG.md.

| Phase | Title | Status |
|---|---|---|
| 1 | Brand system & global mascot logo | ✅ Done |
| 2 | Fix auth persistence on home/logo navigation | ✅ Done |
| 3 | Role-aware member menu (home header) | ✅ Done |
| 4 | Employer dashboard mobile navigation | ✅ Done |
| 5 | Complete Thailand location selector (province/district/subdistrict) | ✅ Done |
| 6 | Home page: remove salary filter + Back-to-Top button | ✅ Done |
| 7 | Final audit of Phases 1–6 | ✅ Done |

## Ground rules for this initiative (from user instructions)
- Finish each phase completely before starting the next.
- Don't stop mid-sequence to ask about running builds.
- No commits, no git push — this session only edits the working tree.
- Preserve all existing working features; don't redesign unrelated pages.
- Official mascot logo + navy/orange theme, consistently applied.
- Every response ends with PROJECT_PLAN.md / HANDOFF.md / CHANGELOG.md
  updated (ARCHITECTURE.md too if architecture changed; AGENTS.md kept in
  sync with coding rules).

## Known environment constraint
This sandbox has no network egress. `next build` cannot complete here
(fails downloading the SWC binary) and `prisma generate`/`migrate` cannot
run either. All work is verified via `tsc --noEmit` + manual brace/paren
balance checks instead. See HANDOFF.md "Commands to run" for what to
execute in a real environment before deploying.
