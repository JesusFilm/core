import { expect, test } from '@playwright/test'

test('redirect results in 404', async ({ page }) => {
  await expect(page.goto('/link-does-not-exist')).rejects.toThrow(
    /ERR_HTTP_RESPONSE_CODE_FAILURE/
  )
})
