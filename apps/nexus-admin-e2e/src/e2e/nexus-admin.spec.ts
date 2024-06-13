import { expect, test } from '@playwright/test'

test('has title on login page', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Welcome to Nexus')).toHaveText(
    'Welcome to Nexus'
  )
})
