import { expect, test } from '@playwright/test'

test('modern test page shows architecture and routing copy', async ({
  page
}) => {
  // `watch-modern` sets Next `basePath: '/watch'` — the route is not at the deployment origin root.
  await page.goto('/watch/modern-test')

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
