import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { test as base } from '@playwright/test'

import { LandingPage } from '../pages/landing-page'
import { Register } from '../pages/register-Page'

type WorkerFixtures = {
  /** Email address for the worker-registered user. */
  workerEmail: string
  /**
   * Absolute path to a Playwright storage-state JSON for the worker-registered
   * user. Unlike a plain `context.storageState()` snapshot, this file has the
   * active teamId injected into `sessionStorage` so that new browser contexts
   * created with `browser.newContext({ storageState })` start with the correct
   * team pre-selected.
   *
   * Why this is needed:
   *   - After registration, `TeamProvider` stores the active team ID only in
   *     React state + sessionStorage (not in the DB — the `updateLastActiveTeamId`
   *     mutation races with `router.push` and may not commit).
   *   - Playwright's `context.storageState()` does not capture sessionStorage.
   *   - We manually merge the sessionStorage value into the JSON file so
   *     Playwright 1.39+ (which supports sessionStorage in storageState) can
   *     restore it in fresh contexts, making the "Create Custom Journey" button
   *     appear without a fresh login.
   */
  workerStorageState: string
}

const SS_KEY = 'journeys-admin:activeTeamId'

const getStoragePath = () =>
  path.join(
    os.tmpdir(),
    `e2e-worker-${process.env.TEST_WORKER_INDEX ?? '0'}.json`
  )

/**
 * Extends Playwright's test with two worker-scoped fixtures:
 *
 * - `workerEmail`        — email for the worker's registered user (logging only)
 * - `workerStorageState` — path to a saved auth snapshot with sessionStorage injected
 *
 * Registration and the storage-state snapshot are created ONCE per Playwright
 * worker. With workers=4 this means 4 total registrations instead of one per
 * spec file (~13), significantly reducing concurrent backend load.
 */
export const test = base.extend<{}, WorkerFixtures>({
  workerEmail: [
    async ({ browser }, use) => {
      const storagePath = getStoragePath()
      const ctx = await browser.newContext()
      const page = await ctx.newPage()
      await new LandingPage(page).goToAdminUrl()
      const register = new Register(page)
      await register.registerNewAccount()
      const email = await register.getUserEmailId()

      // Read the sessionStorage team ID that TeamProvider set during onboarding.
      const teamId = await page.evaluate(
        (key) => sessionStorage.getItem(key),
        SS_KEY
      )

      // Capture auth cookies + localStorage.
      const rawState = await ctx.storageState()

      // TeamProvider reads sessionStorage on first paint; Playwright's restore
      // can still race SSR. URL `?activeTeam=` is highest priority (see
      // TeamProvider) — expose team id to journey-page via env (per worker process).
      if (teamId != null && teamId !== '__shared__') {
        process.env.PLAYWRIGHT_WORKER_ACTIVE_TEAM_ID = teamId
      } else {
        delete process.env.PLAYWRIGHT_WORKER_ACTIVE_TEAM_ID
      }

      // Inject teamId into sessionStorage so Playwright 1.39+ can restore it
      // in new contexts. This ensures the "Create Custom Journey" button is
      // available immediately without a fresh login or DB dependency.
      if (teamId != null && teamId !== '__shared__') {
        for (const origin of rawState.origins) {
          ;(
            origin as typeof origin & {
              sessionStorage?: Array<{ name: string; value: string }>
            }
          ).sessionStorage = [{ name: SS_KEY, value: teamId }]
        }
        // If there are no origins yet, add one for the app origin
        if (rawState.origins.length === 0) {
          const appOrigin = (await page.evaluate(() => window.location.origin)) as string
          ;(
            rawState.origins as Array<{
              origin: string
              localStorage: Array<{ name: string; value: string }>
              sessionStorage?: Array<{ name: string; value: string }>
            }>
          ).push({
            origin: appOrigin,
            localStorage: [],
            sessionStorage: [{ name: SS_KEY, value: teamId }]
          })
        }
      }

      await fs.promises.writeFile(storagePath, JSON.stringify(rawState))
      await page.close()
      await ctx.close()
      console.log(
        `[workerAuth] worker #${process.env.TEST_WORKER_INDEX ?? '?'} registered: ${email} (teamId: ${teamId ?? 'none'})`
      )
      await use(email)
    },
    { scope: 'worker' }
  ],

  workerStorageState: [
    // eslint-disable-next-line no-empty-pattern
    async ({ workerEmail: _email }, use) => {
      // workerEmail fixture has already run and saved the storage state file.
      await use(getStoragePath())
    },
    { scope: 'worker' }
  ]
})

export const expect = test.expect
