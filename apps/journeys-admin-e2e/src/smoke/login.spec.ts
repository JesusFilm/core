import { expect, test } from '../fixtures/authenticated'

test('admin can log in', async ({ authedPage }) => {
  // TeamSelect combobox is enabled in both SharedWithMe and TeamMode once the
  // page has fully loaded. waitUntilDiscoverPageLoadedAsAdmin() (called inside
  // the authenticated fixture) already waits for this, so this assertion is a
  // fast sanity-check that the Discover page rendered successfully.
  await expect(
    authedPage.getByTestId('TeamSelect').getByRole('combobox')
  ).toBeEnabled()
})
