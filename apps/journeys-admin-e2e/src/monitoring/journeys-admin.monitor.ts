import { expect, test } from '@playwright/test'

/*  
Check homepage is accessible
Returns with 200 response
Get text of first login choice and assert it's correct 
*/
test('Homepage checks', async ({ page }) => {
  const response = await page.goto('https://admin.nextstep.is/')
  expect(response?.status()).toEqual(200)
  await expect(page).toHaveTitle(/Sign In|Next Steps/)
  const loginOptionsText = await page
    .locator('li.firebaseui-list-item:nth-child(1)')
    .textContent()
  // Fail intentionally to test notification
  expect(loginOptionsText).toEqual('Sign in with emailEmail')
})
