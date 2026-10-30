# E2E testing (Playwright)

Write tests that reflect exact user requirements. A failing test means a real bug — never hide it.

## Reference elements by the label the user sees in the UI

- GOOD: `getByRole('heading', { name: 'Create Custom Journey' })`
- GOOD: `getByRole('link', { name: 'Analytics' })`
- GOOD: `getByPlaceholder('Paste a YouTube link...')`
- BAD: `locator('div[data-testid="JourneysAdminContainedIconButton"]')`
- BAD: `locator('.MuiCardActionArea-root')`

## Assert exactly what the user should see — no fallbacks

If a required element is not visible, the test must FAIL and surface the bug.

- GOOD: `await expect(page.getByRole('heading', { name: 'Create Custom Journey' })).toBeVisible()`
- BAD: check visibility first and only assert if it happens to be present
- BAD: loop over multiple fallback CSS selectors
- BAD: `try/catch` that swallows an assertion failure

## Always use soft waits — never hard waits

ALL waiting must go through Playwright's built-in auto-waiting. There are zero exceptions in test or page-object code.

Hard waits are banned because they pause unconditionally — they make tests slow on fast machines and still flaky on slow ones. Soft waits retry until the condition is true or the timeout expires.

- GOOD: `await expect(button).toBeEnabled()` — retries until enabled
- GOOD: `await expect(dialog).toBeVisible()` — retries until visible
- GOOD: `await expect(locator).toBeHidden()` — retries until gone
- GOOD: `await page.goto(url)` — Playwright waits for navigation internally
- BAD: `await page.waitForTimeout(2000)` — unconditional pause
- BAD: `await new Promise(resolve => setTimeout(resolve, 1000))` — unconditional pause
- BAD: `sleep(n)` in any form
- BAD: polling loops with `setTimeout` inside tests or page objects

## Wait timeouts must be short, justified, and commented

The default timeout (30s) is enough for stable app states. Only exceed it for known slow operations (cold Vercel SSR, Apollo queries on first load, multi-step server chains). Hard limit is 90s for a wait — never set a `timeout:` above 90000ms on an expect, an action or a `toPass`. The limit is not for the test timeout: that comes from the suite's `playwright.config.ts`, and a test that chains several slow waits calls `test.slow()` with a comment saying why, rather than `test.setTimeout`.

When a timeout exceeds the default, ALWAYS add an inline comment explaining why:

```typescript
// 90s: cold Vercel SSR + TeamProvider Apollo query can take >65s on first run
await expect(createButton).toBeEnabled({ timeout: 90000 })
```

- BAD: `{ timeout: 150000 }` with no comment
- BAD: `{ timeout: 60000 }` as the only value tried when it keeps failing — raise it to 90s and comment
- GOOD: `{ timeout: 30000 }` (default, no comment needed)
- GOOD: `{ timeout: 90000 }` with an inline comment explaining the slow operation

## Scope selectors to the user's visual context

Use the narrowest container that reflects what the user sees. If strict mode fires (multiple matches), that is a real data/state problem — fix the root cause, don't add `.first()`.

- GOOD: `page.locator('div[aria-label="journey-card"]', { hasText: journeyName }).getByRole('link', { name: 'Analytics' })`
- BAD: `page.locator('div[data-testid="AnalyticsItem"] a').first()`

## Running a suite

- **Targets.** journeys-admin-e2e's `e2e` target runs only the smoke set (`src/smoke`); its full suite is `e2e-full`. Every other suite's `e2e` target is its full suite. Tests tagged `@manual` are skipped (`--grep-invert @manual`) by journeys-admin-e2e's `e2e-full`, `update-snapshots` and `debug` targets and by every journeys-e2e target. journeys-admin-e2e's `e2e` and `smoke` targets do not skip them, so a tagged test under `src/smoke` still runs there. Run tagged tests by hand with `pnpm exec playwright test --grep @manual` in the suite's folder; no test carries the tag today.
- **Base URL.** `<APP>_DAILY_E2E` (`JOURNEYS_ADMIN_DAILY_E2E`, `JOURNEYS_DAILY_E2E`, …), else `DEPLOYMENT_URL`, sets the `baseURL` (`apps/journeys-admin-e2e/playwright.config.ts`); with neither set it is the app's local dev server (`http://localhost:4200` for journeys-admin).
- **Accounts.** Authenticated suites sign in with the `PLAYWRIGHT_*` variables: `PLAYWRIGHT_EMAIL` / `PLAYWRIGHT_PASSWORD` through `PLAYWRIGHT_EMAIL5` / `PLAYWRIGHT_PASSWORD5`, plus `PLAYWRIGHT_USER` and `PLAYWRIGHT_TEAM_NAME`. They exist only as GitHub Actions secrets (`.github/workflows/e2e-tests.yml`).
- **Daily E2E.** The scheduled run deploys each app to a Vercel preview and aliases it to `https://<app>-daily-e2e-jesusfilm.vercel.app`, then runs its full suite against that address. It checks out `main`.
- **One suite on demand.** Run the **E2E Tests** workflow by `workflow_dispatch` with `TargetTests` (one suite, or `all-e2e`) and `TargetAppUrl` (the deployment to test, passed to the suite as `DEPLOYMENT_URL`; required for a single suite, ignored for `all-e2e`). A dispatched run checks out the tests of the branch it was dispatched on.
