import { expect, test } from '@playwright/test'

test('modern test page shows architecture and routing copy', async ({
  page
}) => {
  await page.goto('/modern-test')

  await expect(
    page.getByRole('heading', { name: 'Modern Test Page', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Modern Architecture' })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Intelligent Routing' })
  ).toBeVisible()
})
