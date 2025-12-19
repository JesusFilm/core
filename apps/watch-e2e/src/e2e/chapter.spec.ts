import { expect, test } from '@playwright/test'

/* 
Test a chapter:

Navigate to home page 
Click on 'Jesus Calms the Storm Jesus Calms the Storm Chapter
Verify URL is correct
*/
test('Chapter', async ({ page }) => {
  await page.goto('/watch')

  const jesusCalmsStormButton = page.getByRole('button', {
    name: 'Jesus Calms the Storm Jesus Calms the Storm Chapter 1:59'
  })

  await jesusCalmsStormButton.waitFor({ state: 'visible' })
  await expect(jesusCalmsStormButton).toBeEnabled()

  await jesusCalmsStormButton.click()

  // Wait for navigation to complete
  await page.waitForURL('**/jesus-calms-the-storm.html/**', { timeout: 60000 })

  // check it's navigated to the correct URL
  await expect(page).toHaveURL(
    '/watch/jesus-calms-the-storm.html/english.html',
    {
      timeout: 60000
    }
  )
})
