import { expect, test } from '@playwright/test'

/* 
Test a journey by following the journey's selection buttons
*/
test('journeys', async ({ page }) => {
  // 10 mins timeout for this test as it got videos (later we can use 10 seconds videos)
  test.setTimeout(600000)

  await page.goto('/')

  // fact or fiction page - click on on fact or fiction
  await page.click('a[href="/fact-or-fiction"]')
  // test that user actually navigated to the choosen journey
  await expect(page).toHaveURL(/.*fact-or-fiction/)

  await page.getByRole('button', { name: 'Explore Now' }).click()

  // wait for 3 minutes to see if the video is complete - a quick way of finding without writing much code for now
  // eslint-disable-next-line
  await page.waitForTimeout(3 * 60 * 1000)
  await expect(page).toHaveScreenshot({
    animations: 'disabled',
    fullPage: true
  })
  await page.getByText('Yes, it’s a true story', { exact: false }).click()

  // wait for 3 minutes to see if the video is complete - a quick way of finding without writing much code for now
  // eslint-disable-next-line
  await page.waitForTimeout(3 * 60 * 1000)
  await expect(page).toHaveScreenshot({
    animations: 'disabled',
    fullPage: true
  })
  await page.getByText('One question remains', { exact: false }).click()

  // Test Who was this Jesus? screen
  await expect(page).toHaveScreenshot({
    animations: 'disabled',
    fullPage: true
  })

  await page.getByText('The Son of God').click()

  // Test that app automatically navigated user to second journey upon completion of first journey
  // await expect(page).toHaveURL(/.*what-about-the-resurrection/)
  await expect(page).toHaveScreenshot({
    animations: 'disabled',
    fullPage: true
  })
})

/* 
Test a journey by following right arrow
*/

/* 
Test a journey by following left arrow
*/
