import { expect, test } from '@playwright/test'

/**
 * @check
 * @name Journeys Monitoring
 * @retries 8 // Will retry the test 8 times
 * @retryInterval 10 // Will wait 10 seconds between retries
 * @maxRetryTime 600 // Will stop retrying after 10 minutes
 */
test('NS Journey Monitoring: Check if Fact or Fiction journey is displayed', async ({
  page
}) => {
  const response = await page.goto('https://your.nextstep.is/')
  expect(response?.status()).toEqual(200)
  await expect(page).toHaveTitle(/Next Steps/)
  const factOrFictionText = page
    .frameLocator("//iframe[contains(@src, '/embed/fact-or-fiction')]")
    .locator('.MuiTypography-h2')

  await expect(factOrFictionText).toHaveText('Fact or Fiction')
})
