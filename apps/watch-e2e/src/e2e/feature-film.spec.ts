import { expect, test } from '@playwright/test'

/* 
Test a feature film:
Navigate to 'Jesus' page
Click on 'CHAPTER Birth of Jesus'
Verify URL is correct
*/

test('Feature Film', async ({ page }) => {
  await page.goto('/watch/jesus.html/english.html')

  const birthOfJesusButton = page.getByTestId('CarouselItem-birth-of-jesus')
  await birthOfJesusButton.click()

  const url = '/watch/jesus.html/birth-of-jesus/english.html'
  await page.waitForURL(url)
  await expect(page).toHaveURL(url)
})
