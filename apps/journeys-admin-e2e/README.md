# journeys-admin-e2e

Playwright end-to-end test suite for the `journeys-admin` application.

## Running Tests

```bash
# Full test suite
pnpm exec nx run journeys-admin-e2e:e2e-full

# Smoke tests only
pnpm exec nx run journeys-admin-e2e:e2e

# Single spec file
pnpm exec nx run journeys-admin-e2e:e2e-full -- src/e2e/discover/custom-journey.spec.ts

# Single test by name
pnpm exec nx run journeys-admin-e2e:e2e-full -- --grep "should show error for invalid YouTube URL"

# Headed mode (see the browser)
pnpm exec nx run journeys-admin-e2e:e2e-full -- --headed

# Update visual snapshots
pnpm exec nx run journeys-admin-e2e:update-snapshots
```

## Environment Variables

Copy `.env.example` to `.env` (or set these in CI secrets):

| Variable                   | Description                                        |
| -------------------------- | -------------------------------------------------- |
| `JOURNEYS_ADMIN_DAILY_E2E` | URL of the staging deployment to test against      |
| `DEPLOYMENT_URL`           | Fallback URL (e.g. a Vercel preview URL)           |
| `PLAYWRIGHT_EMAIL`         | Email of the pre-existing admin test account       |
| `PLAYWRIGHT_PASSWORD`      | Password for the admin test account                |
| `PLAYWRIGHT_USER`          | Display name for the admin test account            |
| `PLAYWRIGHT_TEAM_NAME`     | Team name used by the admin test account           |
| `EXAMPLE_EMAIL_TOKEN`      | Static OTP token used during new user registration |

If none of the URL variables are set, tests fall back to `http://localhost:4200`.

## Project Structure

```
src/
├── e2e/
│   ├── customization/      # Template customization flow (YouTube, media upload)
│   ├── discover/           # Discover page — journeys, teams, members, sorting
│   ├── lighthouse/         # Performance audits
│   ├── profile/            # User profile & email preferences
│   ├── publisher-and-templates/
│   ├── un-auth/            # Unauthenticated user flows
│   └── users/              # Sign-in / sign-up flows
├── fixtures/
│   ├── authenticated.ts    # authedPage fixture — pre-logged-in page as admin
│   └── workerAuth.ts       # workerEmail fixture — one registration per worker (see below)
├── pages/                  # Page Object Model classes
├── framework/              # Shared helpers (getEmail, getOTP, etc.)
├── smoke/                  # Subset of tests run on every deployment
└── global-setup.ts         # Waits for the target URL to be healthy before tests start
```

## Authentication Architecture

### Admin fixture (`fixtures/authenticated.ts`)

Used by `customization/youtube-video.spec.ts` and other tests that need a stable
pre-existing admin account. A single sign-in state is reused for all tests in the file.

```typescript
import { test, expect } from '../../fixtures/authenticated'

test('my test', async ({ authedPage }) => {
  /* ... */
})
```

### Worker-level registration (`fixtures/workerAuth.ts`)

All `discover/` and `profile/` spec files use a **worker-scoped** fixture that registers
one fresh user per Playwright worker process, then reuses those credentials for every
spec file that runs on that worker.

```typescript
import { test } from '../../fixtures/workerAuth'

test.beforeAll('Register new account', async ({ browser, workerEmail }) => {
  sharedContext = await browser.newContext()
  const page = await sharedContext.newPage()
  await new LandingPage(page).goToAdminUrl()
  await new LoginPage(page).logInWithCreatedNewUser(workerEmail)
})
```

#### How it works

Playwright's `{ scope: 'worker' }` fixture option runs the setup code **once per worker
process** and caches the result. All subsequent requests for `workerEmail` within the
same worker return the cached value instantly — no re-registration.

```
Worker 1 starts
  ├─ spec A beforeAll → fixture runs: registers user → email cached
  ├─ spec B beforeAll → fixture cached: returns email immediately (login only)
  └─ spec C beforeAll → fixture cached: returns email immediately (login only)

Worker 2 starts
  ├─ spec D beforeAll → fixture runs: registers user → email cached
  └─ spec E beforeAll → fixture cached: returns email immediately (login only)
```

#### Why this matters

|                          | Before                                         | After                   |
| ------------------------ | ---------------------------------------------- | ----------------------- |
| Registrations per CI run | ~13 (one per spec file)                        | 4 (one per worker)      |
| Backend load at startup  | High — 13 concurrent OTP + onboarding flows    | Low — 4 staggered flows |
| Test isolation           | Full (each spec gets its own `BrowserContext`) | Full (unchanged)        |

Each spec file still creates its own `BrowserContext`, so sessionStorage, cookies, and
navigation state are completely isolated between spec files. The only thing shared
across spec files on a worker is the server-side user account.

#### Why data accumulation is safe

- All `toHaveCount` assertions target UI element counts (dropdowns, buttons), not total
  journey or team counts.
- Journey and team names use unique random suffixes, so lookups never collide.
- `selectTeamToCopyTheJourney()` uses `.last()` to pick the most-recently-created team,
  so pre-existing teams from earlier spec files on the same worker don't interfere.

## Writing New Tests

### For `discover/` or `profile/` tests

Import `test` from `workerAuth` instead of `@playwright/test`:

```typescript
import type { BrowserContext, Page } from 'playwright-core'

import { test } from '../../fixtures/workerAuth'
import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'

let sharedPage: Page | undefined
let sharedContext: BrowserContext | undefined

test.describe('My feature', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll('Login', async ({ browser, workerEmail }) => {
    sharedContext = await browser.newContext()
    sharedPage = await sharedContext.newPage()
    await new LandingPage(sharedPage).goToAdminUrl()
    await new LoginPage(sharedPage).logInWithCreatedNewUser(workerEmail)
  })

  test.afterAll(async () => {
    await sharedPage?.close()
    await sharedContext?.close()
    sharedPage = undefined
    sharedContext = undefined
  })

  test('does something', async () => {
    /* ... */
  })
})
```

### For `customization/` tests

Use the `authedPage` fixture from `authenticated.ts` (logs in as the shared admin account):

```typescript
import { test, expect } from '../../fixtures/authenticated'

test('my customization test', async ({ authedPage }) => {
  /* ... */
})
```

### Do not register in `beforeAll`

Avoid calling `register.registerNewAccount()` inside a `beforeAll` hook — this causes
concurrent backend load when multiple workers start simultaneously. Use the
`workerEmail` fixture instead, which staggers registrations automatically.
