## E2E Revamp Plan (starting with `journeys-admin-e2e`)

### Goals

- Replace fragile, slow e2e tests with a fast, reliable, maintainable setup
- Start with `journeys-admin-e2e`, then roll out org-wide

### Recommended Stack

- **Runner**: Playwright (auto-waiting, parallel, trace/video, CI-ready)
- **Nx integration**: existing Playwright targets, add cache + affected-only
- **Selectors**: `data-testid` exclusively for stability
- **Pattern**: Page Objects + Test Fixtures + Data Builders
- **Test data**: API-based seeding/reset or DB seeds; deterministic and self-contained
- **Network**: Mock third-party edges via `page.route`; keep core APIs real
- **CI**: Nx cache + affected + sharding; trace/video artifacts on failure

### High-Level Test Strategy

- **Test pyramid**
  - Small set of true end-to-end smoke/user-journeys (3–8 critical flows)
  - Prefer component/contract/integration tests for broader coverage
- **Flake resistance**
  - No arbitrary waits; locator expectations only
  - Stable `data-testid` selectors via page objects
  - Hermetic data per test via seeds/fixtures
- **Speed**
  - Parallelized workers
  - Mock only slow/unstable third-party calls
  - Affected-only strategy in PRs; full suite nightly

### Migration Steps (for `journeys-admin-e2e`)

1. Baseline and scope

   - Identify critical journeys: sign-in, create/edit/publish journey, permissions, search/filter, logout
   - Replace flaky/slow tests; do not migrate 1:1. Delete legacy after parity

2. Align Playwright and Nx

   - Use local `baseURL` fallback `http://localhost:4200` (matches `journeys-admin:serve`)
   - Add Playwright `webServer` to run `nx serve journeys-admin` locally
   - Keep retries minimal: `1` in CI, `0` local. Traces on retry, screenshots on failure

3. Dev server orchestration

   - Playwright `webServer` waits for the app locally
   - In CI, use environment `DEPLOYMENT_URL`/preview URLs (no local server)

4. Test data strategy

   - Create small e2e “test-data” helpers:
     - Authenticate (reuse UI or programmatic token)
     - Seed minimal entities via API or seed route
     - Builders for Journey/User/Permission
     - Idempotent naming with unique suffixes (timestamp/uuid)

5. Page Objects + Fixtures

   - Page Objects in `src/pages/*` for Login, Dashboard, Journeys, Publisher
   - Fixtures: `authenticatedPage`, `testUser`, `testJourney`
   - Keep assertions in tests; Page Objects perform actions only

6. Stable selectors

   - Add `data-testid` to UI components touched by e2e; avoid text/CSS selectors
   - Naming convention: `ja-<area>-<element>`

7. Smoke suite (first)

   - Login as admin user
   - Create a journey and verify in list
   - Edit journey metadata
   - Publish journey and verify status
   - Permission guard (non-admin blocked)
   - Search/filter returns expected journey
   - Logout

8. Flake elimination

   - Remove all `waitForTimeout`; rely on locator expectations and network signals
   - Use `route.fulfill` only for third-party calls

9. CI setup

   - PRs: `nx affected -t e2e --parallel` with sharding if needed
   - Nx remote cache on
   - Upload Playwright traces/screenshots on failures
   - Nightly full runs per app

10. Governance & docs

- 1-pager guidelines: selectors, waits, page objects, data seeding, test pyramid
- PR checks for `affected:e2e` on changed admin code
- Zero flake tolerance; quarantine and ticket if a test flakes twice/week

11. Decommission legacy e2e

- After smoke parity + 1–2 weeks of stable CI, delete old tests/tooling
- Keep an archive branch

### Pseudocode Blueprint

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:4200',
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retry-with-video'
  },
  retries: process.env.CI ? 1 : 0,
  fullyParallel: true,
  reporter: [['list'], ['html']],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'nx serve journeys-admin',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI
  }
})
```

```ts
// src/support/data/journeyBuilder.ts
export function buildJourney(overrides?: Partial<{ title: string; description: string }>) {
  return {
    title: `e2e-journey-${Date.now()}`,
    description: 'e2e',
    ...overrides
  }
}
```

```ts
// src/fixtures/authenticated.ts
import { test as base } from '@playwright/test'
import type { Page } from 'playwright-core'
import { LoginPage } from '../pages/login-page'

export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    await page.goto('/')
    await new LoginPage(page).login('admin')
    await use(page)
  }
})
export const expect = test.expect
```

```ts
// src/smoke/create-journey.spec.ts
import { expect } from '@playwright/test'
import { test } from '../fixtures/authenticated'
import { JourneyPage } from '../pages/journey-page'

test('admin can create a journey', async ({ authedPage }) => {
  const journeyPage = new JourneyPage(authedPage)
  await journeyPage.clickCreateCustomJourney()
  await journeyPage.createAndVerifyCustomJourney()
})
```

### Success Criteria

- Admin e2e CI time ≤ 4–6 minutes; smoke suite ≤ 8 tests
- Zero arbitrary waits; <0.5% flake rate over 2 weeks
- Affected-only runs integrated with Nx in PRs
- Trace artifacts on every failure
