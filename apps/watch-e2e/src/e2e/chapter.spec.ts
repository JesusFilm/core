import { expect, test } from '@playwright/test'

/* 
Test a chapter:

Navigate to home page 
Click on 'Jesus Calms the Storm Jesus Calms the Storm Chapter
Verify URL is correct
*/
test('Chapter', async ({ page }) => {
  // Set test time out as it has video
  test.setTimeout(7 * 60 * 1000)

  await page.goto('/watch')

  await page
    .getByRole('button', {
      name: 'Jesus Calms the Storm Jesus Calms the Storm Chapter 1:59'
    })
    .click()

  // check it's navigated to the correct URL
  await expect(page).toHaveURL('/watch/jesus-calms-the-storm.html/english.html')
})
