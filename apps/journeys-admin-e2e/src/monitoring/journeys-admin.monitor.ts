/* eslint-disable playwright/no-networkidle */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable playwright/no-conditional-in-test */
import { expect, test } from '@playwright/test'

/*  
NS Admin: Monitoring
https://www.checklyhq.com/docs/cli/
*/
test('NS Admin Monitoring: Check user can login and logout successfuly', async ({
  page
}) => {
  if (!process.env.PLAYWRIGHT_EMAIL || !process.env.PLAYWRIGHT_PASSWORD) {
    throw new Error(
      'Email & password environment variables are not set in checkly.'
    )
  }

  const email = process.env.PLAYWRIGHT_EMAIL
  const password = process.env.PLAYWRIGHT_PASSWORD

  await page.goto('https://admin.nextstep.is/')

  // Wait for all network calls to finish
  await page.waitForLoadState('networkidle')

  // Enter user email
  await page.getByPlaceholder('Enter your email address here').fill(email)
  await expect(page.locator('input[type="email"]')).toHaveValue(email)
  await page.getByRole('button', { name: 'Continue with email' }).click()

  // Wait for the password input to appear
  // eslint-disable-next-line playwright/no-wait-for-selector
  await page.waitForSelector('input[type="password"]')
  // Wait for all network calls to finish
  await page.waitForLoadState('networkidle')

  // Enter user password
  await page.getByPlaceholder('Enter Password').click()
  await page.getByPlaceholder('Enter Password').fill(password)
  await page.getByRole('button', { name: 'Sign In' }).click()

  // Expect that email in the profile menu matches the email used to login
  await page.getByTestId('NavigationListItemProfile').click()
  await expect(page.getByRole('menu')).toContainText(email)
  await page.getByText('Logout').click()

  // Expect that 'Continue with email' button is visible
  await expect(
    page.getByTestId('EmailSignInForm').getByRole('button')
  ).toContainText('Continue with email')
})
