import { expect, test } from '@playwright/test'

/*  
NS Admin: Homepage monitoring
Returns with 200 response
Page name is Sign In|Next Steps
'Sign in with email' button is visible
*/
test('NS Admin: Homepage monitoring', async ({ page }) => {
  const response = await page.goto('https://admin.nextstep.is/')
  expect(response?.status()).toEqual(200)
  await expect(page).toHaveTitle(/Sign In|Next Steps/)

  const emailSignInButton = await page.getByRole('button', {
    name: 'Sign in with email'
  })
  expect(emailSignInButton).toBeVisible()
})
