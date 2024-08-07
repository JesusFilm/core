import { expect, test } from '@playwright/test'

/* 
Test a chapter:

Navigate to home page 
Take screenshot - so it will be tested all the times (This checks 'Jesus' is the first video)
Click on 'Jesus Calms the Storm Jesus Calms the Storm Chapter
Take screenshot - so it will be tested all the times
Click on the Play button
Wait for two minutes as this video is for 1.59 minutes
Take screenshot - so it will be tested all the times
*/
test('Chapter', async ({ page }) => {
  // Set test time out as it has video
  test.setTimeout(7 * 60 * 1000)

  await page.goto('/watch')

  // Get and log the current URL
  const url = page.url()
  console.log('Current URL:', url)

  // video tiles aren't loading upon right away and there is no event to say they are loaded. So the only option is to hard wait
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(8 * 1000)
  // Note: all video tiles are not fully loading
  // await expect(page).toHaveScreenshot('home-page.png', {
  //   animations: 'disabled',
  //   fullPage: true,
  //   timeout: 10000
  // })

  await page
    .getByRole('button', {
      name: 'Jesus Calms the Storm Jesus Calms the Storm Chapter 1:59'
    })
    .click()

  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(8 * 1000)
  // await expect(page).toHaveScreenshot('before-video.png', {
  //   animations: 'disabled',
  //   fullPage: true
  // })

  // check it's navigated to the correct URL
  await expect(page).toHaveURL('/watch/jesus-calms-the-storm.html/english.html')

  await page.getByRole('button', { name: 'Play' }).click()

  // wait for 3 minutes to see if the video until there are some events thta can say the state of the video
  // later find a way to check if the video is complete and check if the video is playing. Also use 10 seconds video
  // await page.waitForTimeout(3 * 60 * 1000)

  // Take screenshot once video is played and test it is same all the times
  // await expect(page).toHaveScreenshot('after-video.png', {
  //   animations: 'disabled',
  //   fullPage: true
  // })
})
