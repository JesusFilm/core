import { expect, test } from '@playwright/test'

const email = process.env.PLAYWRIGHT_VIDEOS_ADMIN_EMAIL
const password = process.env.PLAYWRIGHT_VIDEOS_ADMIN_PASSWORD

test('email sign-in reaches the dashboard when credentials are configured', async ({
  page
}) => {
  // Gated on repo secrets — do not fail CI when unset.
  // eslint-disable-next-line playwright/no-skipped-test -- optional secrets PLAYWRIGHT_VIDEOS_ADMIN_EMAIL / PASSWORD
  test.skip(
    email == null ||
      email.length === 0 ||
      password == null ||
      password.length === 0,
    'Set PLAYWRIGHT_VIDEOS_ADMIN_EMAIL and PLAYWRIGHT_VIDEOS_ADMIN_PASSWORD to run this flow against a real Firebase user in the target environment.'
  )

  await page.goto('/users/sign-in')

  await page.getByLabel('Email').fill(email as string)
  await page.getByLabel('Password', { exact: true }).fill(password as string)
  await page.getByRole('button', { name: 'Sign in' }).click()

  // 90s: Firebase auth + session bootstrap on cold Vercel preview can exceed the default test timeout
  await expect(page).toHaveURL(/\/(videos)?(\/)?$/, { timeout: 90000 })
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({
    timeout: 90000
  })
})
