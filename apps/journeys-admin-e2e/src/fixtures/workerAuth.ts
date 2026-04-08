import { test as base } from '@playwright/test'

import { LandingPage } from '../pages/landing-page'
import { Register } from '../pages/register-Page'

type WorkerFixtures = { workerEmail: string }

/**
 * Extends Playwright's test with a worker-scoped `workerEmail` fixture.
 *
 * Registration runs exactly once per Playwright worker — not once per spec file.
 * With workers=4, this means 4 total registrations instead of one per spec file (~13),
 * which significantly reduces concurrent backend load.
 *
 * Each spec file still creates its own BrowserContext and logs in with these
 * credentials, preserving full browser-level isolation (separate sessionStorage/cookies).
 */
export const test = base.extend<{}, WorkerFixtures>({
  workerEmail: [
    async ({ browser }, use) => {
      const ctx = await browser.newContext()
      const page = await ctx.newPage()
      await new LandingPage(page).goToAdminUrl()
      const register = new Register(page)
      await register.registerNewAccount()
      const email = await register.getUserEmailId()
      await page.close()
      await ctx.close()
      await use(email)
    },
    { scope: 'worker' }
  ]
})

export const expect = test.expect
