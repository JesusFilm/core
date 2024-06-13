import { expect, test } from '@playwright/test'

/*  
NS Admin: Monitoring
*/
test('NS Admin Monitoring: Check user can login and logout successfuly', async ({
  page
}) => {
  await page.goto('https://admin.nextstep.is/')
  await page.getByPlaceholder('Enter your email address here').click()
  await page
    .getByPlaceholder('Enter your email address here')
    .fill(process.env.PLAYWRIGHT_EMAIL)
  await page.getByRole('button', { name: 'Continue with email' }).click()
  await page.getByPlaceholder('Enter Password').click()
  await page.getByPlaceholder('Enter Password').fill('pwu@ec')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.getByTestId('NavigationListItemProfile').click()
  await expect(page.getByText(process.env.PLAYWRIGHT_EMAIL)).toBeVisible()
  await page.getByText('Logout').click()
  await expect(
    page.getByRole('button', { name: 'Continue with email' })
  ).toBeVisible()
})
