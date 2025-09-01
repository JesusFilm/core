import { expect, test } from '../fixtures/authenticated'

test('admin can log in', async ({ authedPage }) => {
  await expect(
    authedPage.locator('div[data-testid="JourneysAdminContainedIconButton"]')
  ).toBeVisible()
})
