import { expect, test } from '@playwright/test'

/*  
Check homepage is accessible
Returns with 200 response
Get text of a locator and assert it's correct 
*/
test('Homepage checks', async ({ page }) => {
  const response = await page.goto('https://your.nextstep.is/')
  expect(response?.status()).toEqual(200)
  await expect(page).toHaveTitle(/Next Steps/)
  const factOrFictionText = await page
    .frameLocator("//iframe[contains(@src, '/embed/fact-or-fiction')]")
    .locator('.MuiTypography-h2')
    .textContent()
  expect(factOrFictionText).toEqual('Fact or Fiction')
})
