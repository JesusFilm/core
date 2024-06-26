import { expect, test } from '@playwright/test'

/*  
NS Admin: Monitoring
*/
test('NS Admin Monitoring: Check user can login and logout successfuly', async ({
  page
}) => {
  if (!process.env.PLAYWRIGHT_EMAIL || !process.env.PLAYWRIGHT_PASSWORD) {
    throw new Error(
      'Email & password environment variables are not set in checkly.'
    )
  }

  const email = process.env.PLAYWRIGHT_EMAIL as string
  const password = process.env.PLAYWRIGHT_PASSWORD as string

  await page.goto('https://admin.nextstep.is/')
  await page.getByPlaceholder('Enter your email address here').click()
  await page.getByPlaceholder('Enter your email address here').fill(email)
  await page.getByRole('button', { name: 'Continue with email' }).click()
  await page.getByPlaceholder('Enter Password').click()
  await page.getByPlaceholder('Enter Password').fill(password)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.getByTestId('NavigationListItemProfile').click()
  await expect(page.getByText(email)).toBeVisible()
  await page.getByText('Logout').click()
  await expect(
    page.getByRole('button', { name: 'Continue with email' })
  ).toBeVisible()
})
