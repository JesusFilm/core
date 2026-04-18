import { expect, test } from '@playwright/test'

test('docs sidebar navigates from Welcome to a nested Basics doc', async ({
  page
}) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Welcome', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Welcome', exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Basics' }).click()
  await page.getByRole('link', { name: 'Architecture Concepts', exact: true }).click()
  await expect(page).toHaveURL(/basics\/architecture-concepts/)
  await expect(
    page.getByRole('heading', { name: 'Architecture Concepts', exact: true })
  ).toBeVisible()
})
