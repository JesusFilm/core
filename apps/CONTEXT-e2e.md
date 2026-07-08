# E2E Testing

The end-to-end verification surface: eleven Playwright suites (`apps/*-e2e`), one per app surface, that exercise a _deployed_ app through a browser (or its public HTTP API) rather than mocking. Owns no product entities — journey, video, and language vocabulary in specs is the owning contexts'; this context owns only the vocabulary of how the suites target, run, and report.

## Language

**E2E Suite**:
The per-app Playwright project (`<app>-e2e`) that tests one deployed surface end to end. Suites vary hugely in depth — from a single landing-page smoke check to journeys-admin's full page-object-driven regression suite.
_Avoid_: e2e tests (say which suite), integration tests (those are Vitest, in-process)

**Deployment URL**:
The base URL a suite runs against, resolved per suite as: the suite's Daily E2E override (`<APP>_DAILY_E2E`), else `DEPLOYMENT_URL`, else the app's local dev port. A suite never starts the app itself in CI — it points at something already deployed.

**Daily E2E**:
The scheduled every-morning run (6am NZ): each app is freshly deployed to a Vercel preview, aliased to a stable `<app>-daily-e2e` hostname, and its full suite runs against that deployment; failures notify Slack. Arclight is excluded (its API needs database access a Vercel preview doesn't have). The same workflow can be dispatched manually for a single suite against any URL.
_Avoid_: nightly (it's anchored to NZ mornings), CI e2e (PR runs are a different path)

**Playwright User**:
One of the pool of five shared, real test accounts (email/password secrets, plus a designated team) that authenticated suites sign in with. Shared mutable state, not per-run seeded data — suites can collide on it.
_Avoid_: test fixture, seeded user

**Smoke vs Full (journeys-admin)**:
journeys-admin-e2e splits into a small smoke set (login, create journey) and the full suite. Terminology trap: its target named plain `e2e` runs only the smoke set — the full suite is `e2e-full` — while every other suite's `e2e` target _is_ its full suite.

**Monitor**:
A Checkly uptime check written as a Playwright test (`*.monitor.ts`, currently journeys-admin only) — a production health probe on a retry schedule, not part of any suite run.
_Avoid_: monitoring test (it never runs with the suite)

**Contract Spec (arclight)**:
arclight-e2e's dominant style: request-level assertions that the legacy REST façade's response _shape_ (fields, types, URL patterns) still matches what external API-key consumers depend on — structure matching, not golden-file diffing. Requests send a cache-bypass header so the origin, not a cached copy, is verified.
_Avoid_: golden tests, snapshot tests (visual snapshots are a separate, minor mechanism)
