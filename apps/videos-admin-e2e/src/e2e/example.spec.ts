import { expect, test } from '@playwright/test'

test('Authentication', async ({ page }) => {
  await page.goto('/')

  // Expect h1 to contain a substring.
  await expect(
    page.getByRole('button', { name: 'Log in with Google' })
  ).toBeVisible()
})
