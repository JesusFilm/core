import { test, expect } from '@playwright/test'
/* 
Test a journey by following the journey's selection buttons
*/
test('journeys', async ({ page }) => {
  // 10 mins timeout for this test as it got videos (later we can use 10 seconds videos)
  test.setTimeout(600000)

  await page.goto('/')
  // disable annimation before taking screenshot
  await expect(page).toHaveScreenshot({animations: "disabled", fullPage: true });

  // fact or fiction page - click on on fact or fiction
  await page.click('a[href="/fact-or-fiction"]')
  // test that user actually navigated to the choosen journey
  await expect(page).toHaveURL(/.*fact-or-fiction/)
  await expect(page).toHaveScreenshot({animations: "disabled", fullPage: true });
  await page.getByRole('button', { name: 'Explore Now' }).click()

  await expect(page).toHaveScreenshot({animations: "disabled", fullPage: true });
  await page.getByText('Yes, it’s a true story', { exact: false }).click()

  await page.getByText('One question remains', { exact: false }).click()
  await expect(page).toHaveScreenshot({animations: "disabled", fullPage: true });

  await page.getByText('The Son of God').click()
  await expect(page).toHaveScreenshot({animations: "disabled", fullPage: true });

  // Test that app automatically navigated user to second journey upon completion of first journey
  await expect(page).toHaveURL(/.*what-about-the-resurrection/)
  await expect(page).toHaveScreenshot({animations: "disabled", fullPage: true });
})

/* 
Test a journey by following right arrow
*/


/* 
Test a journey by following left arrow
*/
