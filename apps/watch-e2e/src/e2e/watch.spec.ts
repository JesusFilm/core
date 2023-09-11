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
  // 8 mins timeout for this test as it got videos (later we can use 10 seconds videos)
  test.setTimeout(8 * 60 * 1000)

  await page.goto('/')

  // Get and log the current URL
  const url = page.url()
  console.log('Current URL:', url)

  // Screenshot test are not stable - so give a hard wait and try
  // eslint-disable-next-line
  await page.waitForTimeout(1 * 60 * 1000)
  // Note: all video tiles are not fully loading
  await expect(page).toHaveScreenshot('home-page.png', {
    animations: 'disabled',
    fullPage: true,
    timeout: 10000
  })

  await page
    .getByRole('button', {
      name: 'Jesus Calms the Storm Jesus Calms the Storm Chapter 1:59'
    })
    .click()

  // Screenshot test are not stable - so give a hard wait and try
  // eslint-disable-next-line
  await page.waitForTimeout(1 * 60 * 1000)
  await expect(page).toHaveScreenshot('before-video.png', {
    animations: 'disabled',
    fullPage: true
  })

  await page.getByRole('button', { name: 'Play' }).click()

  // wait for 3 minutes to see if the video is complete - a quick way of finding without writing much code for now
  // later find a way to check if the video is complete and check if the video is playing. Also use 10 seconds video
  // eslint-disable-next-line
  await page.waitForTimeout(3 * 60 * 1000)

  // Take screenshot once video is played and test it is same all the times
  await expect(page).toHaveScreenshot('after-video.png', {
    animations: 'disabled',
    fullPage: true
  })
})
