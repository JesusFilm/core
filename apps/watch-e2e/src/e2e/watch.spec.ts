import { expect, test } from '@playwright/test'

/* 
Test a single video that doesn't have any chapters:

Navigate to home page 
Take screenshot - so it will be tested all the times
Click on 'Jesus Calms the Storm Jesus Calms the Storm Chapter
Take screenshot - so it will be tested all the times
Click on the Play button
Wait for two minutes as this video is for 1.59 minutes
Take screenshot - so it will be tested all the times
*/
test('Test single video', async ({ page }) => {
  // 3 mins timeout for this test as it got videos (later we can use 10 seconds videos)
  test.setTimeout(3 * 60 * 1000)

  await page.goto('/')

  // Get and log the current URL
  const url = page.url()
  console.log('Current URL:', url)

  await expect(page).toHaveScreenshot({
    animations: 'disabled',
    fullPage: true,
    timeout: 10000
  })

  await page
    .getByRole('button', {
      name: 'Jesus Calms the Storm Jesus Calms the Storm Chapter 1:59'
    })
    .click()

  await expect(page).toHaveScreenshot({
    animations: 'disabled',
    fullPage: true
  })

  await page.getByRole('button', { name: 'Play Video' }).click()

  // wait for 2 minutes to see if the video is complete - a quick way of finding without writing much code for now
  // eslint-disable-next-line
  await page.waitForTimeout(2 * 60 * 1000)

  // Take screenshot once video is played and test it is same all the times
  await expect(page).toHaveScreenshot({
    animations: 'disabled',
    fullPage: true
  })
})
