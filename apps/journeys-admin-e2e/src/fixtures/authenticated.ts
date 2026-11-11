import { test as base } from '@playwright/test'
import type { Page } from 'playwright-core'

import { CampaignBuilderPage } from '../pages/campaign-builder-page'
import { LoginPage } from '../pages/login-page'

// The cleanup runs after the test, whose own timeout a slow cold run can use
// up; it gets its own budget so the campaign is not left behind
const CAMPAIGN_CLEANUP_TIMEOUT_MS = 60 * 1000

export const test = base.extend<{
  authedPage: Page
  campaignBuilder: CampaignBuilderPage
}>({
  authedPage: async ({ page }, use) => {
    await page.goto('/')
    const loginPage = new LoginPage(page)
    await loginPage.login('admin')
    await use(page)
  },
  /**
   * The campaign editor, signed in. Its teardown deletes the campaign the
   * test left open in the editor; a campaign it cannot delete (a run that
   * failed before its editor opened, or a Playwright User who is not a team
   * manager) is left for the e2eCleanup sweep, which finds it by its title.
   */
  campaignBuilder: [
    async ({ authedPage }, use, testInfo) => {
      const campaignBuilder = new CampaignBuilderPage(authedPage)
      await use(campaignBuilder)

      const deleted = await campaignBuilder.deleteCampaign()
      if (!deleted) {
        testInfo.annotations.push({
          type: 'cleanup',
          description: 'No campaign editor was open, so nothing was deleted'
        })
      }
    },
    { timeout: CAMPAIGN_CLEANUP_TIMEOUT_MS }
  ]
})

export const expect = test.expect
