import { expect, test } from '@playwright/test'

// just to run the tests daily
test('has title', async ({ page }) => {
  await page.goto('/')

  // Expect h1 to contain a substring.
  expect(await page.locator('h1').innerText()).toContain(
    'Welcome to Nexus Admin'
  )
})
