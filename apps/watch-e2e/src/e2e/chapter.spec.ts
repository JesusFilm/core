import { expect, test } from '@playwright/test'

/* 
Test a chapter:

Navigate to home page 
Click on 'The Birth of Jesus' chapter
Verify URL is correct
*/
test('Chapter', async ({ page }) => {
  await page.goto('/watch')

  const theBirthOfJesusButton = page.getByRole('button', {
    name: 'The Birth of Jesus 4:33'
  })

  await theBirthOfJesusButton.click()

  const url = '/watch/the-savior.html/the-birth-of-jesus/english.html'
  await page.waitForURL(url)
  await expect(page).toHaveURL(url)
})
