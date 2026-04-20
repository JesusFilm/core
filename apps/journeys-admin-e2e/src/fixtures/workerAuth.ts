import { promises } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

import {
  type Browser,
  type BrowserContext,
  test as base
} from '@playwright/test'

import { LandingPage } from '../pages/landing-page'
import { Register } from '../pages/register-Page'

type WorkerFixtures = {
  /** Email address for the worker-registered user. */
  workerEmail: string
  /**
   * Absolute path to a Playwright storage-state JSON for the worker-registered
   * user (cookies + localStorage). Session keys such as `journeys-admin:activeTeamId`
   * are **not** restored from this file by Playwright — use
   * {@link newContextWithWorkerStorageState} so an init script sets them before navigation.
   */
  workerStorageState: string
}

const SS_KEY = 'journeys-admin:activeTeamId'

const getStoragePath = () =>
  join(tmpdir(), `e2e-worker-${process.env.TEST_WORKER_INDEX ?? '0'}.json`)

/**
 * Creates a browser context with the worker auth snapshot and, when the worker
 * registered a real team id, injects `journeys-admin:activeTeamId` into
 * `sessionStorage` before any document loads.
 *
 * Playwright persists cookies/localStorage/IndexedDB in `storageState`, but its
 * restore path clears `sessionStorage` and does not apply ad-hoc `sessionStorage`
 * entries from the JSON file — see
 * https://playwright.dev/docs/auth#session-storage
 */
export async function newContextWithWorkerStorageState(
  browser: Browser,
  storageStatePath: string
): Promise<BrowserContext> {
  const context = await browser.newContext({
    storageState: storageStatePath
  })
  const teamId = process.env.PLAYWRIGHT_WORKER_ACTIVE_TEAM_ID
  if (teamId != null && teamId !== '' && teamId !== '__shared__') {
    await context.addInitScript(
      ({ key, value }: { key: string; value: string }) => {
        window.sessionStorage.setItem(key, value)
      },
      { key: SS_KEY, value: teamId }
    )
  }
  return context
}

/**
 * Extends Playwright's test with two worker-scoped fixtures:
 *
 * - `workerEmail`        — email for the worker's registered user (logging only)
 * - `workerStorageState` — path to a saved auth snapshot
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

      // Capture auth cookies + localStorage (+ IndexedDB metadata).
      const rawState = await ctx.storageState()

      // TeamProvider reads sessionStorage on first paint; URL `?activeTeam=` is
      // highest priority (see TeamProvider) — expose team id via env for
      // journey-page discover URL construction.
      if (teamId != null && teamId !== '__shared__') {
        process.env.PLAYWRIGHT_WORKER_ACTIVE_TEAM_ID = teamId
      } else {
        delete process.env.PLAYWRIGHT_WORKER_ACTIVE_TEAM_ID
      }

      await promises.writeFile(storagePath, JSON.stringify(rawState))
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
    async ({ workerEmail }, use) => {
      void workerEmail
      // workerEmail fixture has already run and saved the storage state file.
      await use(getStoragePath())
    },
    { scope: 'worker' }
  ]
})

export const expect = test.expect
