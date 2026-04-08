import { expect, test } from '../fixtures/authenticated'

test('admin can log in', async ({ authedPage }) => {
  await expect(
    authedPage.getByRole('button', { name: 'Create Custom Journey' })
  ).toBeVisible()
})
