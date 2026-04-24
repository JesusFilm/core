import { expect, test } from '@playwright/test'

test('docs sidebar navigates from Welcome to a nested Basics doc', async ({
  page
}) => {
  await page.goto('/')

  // Docusaurus surfaces the doc card as "Welcome - 5min" (plus emoji), not the bare word "Welcome".
  await page.getByRole('link', { name: /Welcome/i }).click()
  await expect(page.getByRole('heading', { name: /Welcome/i })).toBeVisible()

  const navToggle = page.getByRole('button', { name: 'Toggle navigation bar' })
  if (await navToggle.isVisible()) {
    await navToggle.click()
  }

  await page.getByRole('button', { name: 'Basics' }).click()
  await page
    .getByRole('link', { name: 'Architecture Concepts', exact: true })
    .click()
  await expect(page).toHaveURL(/basics\/architecture-concepts/)
  await expect(
    page.getByRole('heading', { name: 'Architecture Concepts', exact: true })
  ).toBeVisible()
})
