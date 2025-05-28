import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'
import path from 'path'

export default defineConfig({
  projectName: 'Core',
  logicalId: 'core',
  repoUrl: 'https://github.com/JesusFilm/core',
  checks: {
    playwrightConfigPath: path.resolve(__dirname, 'apps/journeys-admin-e2e/playwright.config.ts'),
    playwrightChecks: [
      {
        name: 'Critical Flows',
        logicalId: 'critical-flows',
        pwTags: '@monitor',
        frequency: Frequency.EVERY_15M,
        locations: ['us-east-1'],
      }
    ],
  },
  cli: {
    runLocation: 'us-east-1',
    retries: 3,
  },
})