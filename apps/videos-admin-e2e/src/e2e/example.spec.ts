import { expect, test } from '@playwright/test'

test('Authentication', async ({ page }) => {
  await page.goto('/')

  // Expect h1 to contain a substring.
  expect(await page.locator('label').innerText()).toContain('Email')
})
