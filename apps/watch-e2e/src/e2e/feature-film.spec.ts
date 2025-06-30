import { expect, test } from '@playwright/test'

/* 
Test a feature film:

Navigate to home page 
Click on 'Jesus' chapter
Take a screenshot (chapters-landing-page)
Click on right arrow
Click on right arrow again
Click on right left
Take a screenshot (chapters-click-page)
Click on 'Blessed are those Who Hear and Obey'
Take a screenshot (before-video)
Click on the Play button
Wait for 20 seconds as this video is 19 seconds
Take screenshot (after-video)
*/

test.describe('firefox only', () => {
  // skip the test if mobile as no.of video clips differs based on the device size
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(({ browserName }) => browserName !== 'firefox', 'firefox only!')

  test('Feature film', async ({ page, browser }) => {
    // Set test time out as it has video
    test.setTimeout(5 * 60 * 1000)

    await page.goto('/watch')

    // Try to find the button with a more flexible selector
    let jesusButton
    try {
      jesusButton = page.getByRole('button', {
        name: 'JESUS JESUS Feature Film 61 chapters'
      })
      const buttonExists = await jesusButton.isVisible()

      if (!buttonExists) {
        // Try just looking for any button with "JESUS" and "Feature Film"
        jesusButton = page
          .locator('button, [role="button"], a')
          .filter({ hasText: 'JESUS' })
          .filter({ hasText: 'Feature Film' })
          .first()
      }
    } catch (e) {
      // Try just looking for any button with "JESUS" and "Feature Film"
      jesusButton = page
        .locator('button, [role="button"], a')
        .filter({ hasText: 'JESUS' })
        .filter({ hasText: 'Feature Film' })
        .first()
    }

    await jesusButton.click()

    // Add a small wait to see if navigation starts
    await page.waitForTimeout(2000)

    // video tiles aren't loading upon right away and there is no event to say they are loaded. So the only option is to hard wait
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(6 * 1000)

    // await expect(page).toHaveScreenshot('ff-landing-page.png', {
    //   animations: 'disabled',
    //   fullPage: true
    // })

    // check it's navigated to the correct URL
    await expect(page).toHaveURL('watch/jesus.html/english.html')

    // check navigation buttons are working
    await page.getByTestId('NavigateNextIcon').click()
    await page.getByTestId('NavigateNextIcon').click()
    await page.getByTestId('NavigateBeforeIcon').click()

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(6 * 1000)
    // await expect(page).toHaveScreenshot('ff-navigated-page.png', {
    //   animations: 'disabled',
    //   fullPage: true
    // })

    await page
      .getByRole('button', {
        name: 'Blessed are those Who Hear and Obey'
      })
      .click()

    await expect(page).toHaveURL(
      '/watch/jesus.html/blessed-are-those-who-hear-and-obey/english.html'
    )

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(6 * 1000)
    // await expect(page).toHaveScreenshot('before-video.png', {
    //   animations: 'disabled',
    //   fullPage: true
    // })

    await page.getByRole('button', { name: 'Play' }).first().click()

    // wait for 60 seconds to see if the video is complete. Until there are some events in the code to figure this out
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(45 * 1000)

    // Take screenshot once video is played and test it is same all the times
    // await expect(page).toHaveScreenshot('after-video.png', {
    //   animations: 'disabled',
    //   fullPage: true
    // })
  })
})
