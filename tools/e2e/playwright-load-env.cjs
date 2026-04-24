'use strict'

const path = require('path')
const dotenv = require('dotenv')

/**
 * Load env for Playwright:
 * 1. Monorepo root `.env` (e.g. `DOCS_DAILY_E2E`, `JOURNEYS_DAILY_E2E`, …)
 * 2. `apps/<suite>-e2e/.env` with override so per-suite secrets can win.
 *
 * @param {string} configDirname - `__dirname` from the Playwright config (`apps/<suite>-e2e`)
 */
function loadPlaywrightEnv(configDirname) {
  const repoRoot = path.resolve(configDirname, '..', '..')
  dotenv.config({ path: path.join(repoRoot, '.env') })
  dotenv.config({ path: path.join(configDirname, '.env'), override: true })
}

module.exports = { loadPlaywrightEnv }
