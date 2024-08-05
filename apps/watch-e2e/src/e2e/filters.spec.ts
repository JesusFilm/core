import { expect, test } from '@playwright/test'

/* 
Test a Filters:

Navigate to home page 
Click on 'Seel All' button
Select 'Telugu' audion & 'English' subtitles
Check the URL has correct parameters
*/
test('Filters', async ({ page }) => {
  await page.goto('/watch')

  // Get and log the current URL
  const url = page.url()
  console.log('Current URL:', url)

  await page.getByTestId('SeeAllVideos').click()

  // all tiles aren't loading. Change it to use events when that is implemented in the code
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(8 * 1000)

  // Take screenshot
  // await expect(page).toHaveScreenshot('see-all-landing.png', {
  //   animations: 'disabled',
  //   fullPage: true
  // })

  // Choose audio language
  await page
    .getByTestId('FilterList')
    .locator('div')
    .filter({
      hasText: 'LanguagesSearch LanguagesSearch Languages2000+ languages'
    })
    .getByLabel('Open')
    .click()
  await page
    .getByTestId('FilterList')
    .locator('div')
    .filter({
      hasText: 'LanguagesSearch LanguagesSearch Languages2000+ languages'
    })
    .getByLabel('Search Languages')
    .fill('telu')
  await page.getByRole('option', { name: 'Telugu తెలుగు' }).click()

  // Choose subtittles language
  await page
    .getByTestId('FilterList')
    .locator('div')
    .filter({
      hasText: 'SubtitlesSearch LanguagesSearch Languages54 languages'
    })
    .getByLabel('Open')
    .click()
  await page
    .getByTestId('FilterList')
    .locator('div')
    .filter({
      hasText: 'SubtitlesSearch LanguagesSearch Languages54 languages'
    })
    .getByLabel('Search Languages')
    .fill('eng')
  await page.getByRole('option', { name: 'English' }).click()
  // eslint-disable-next-line playwright/no-networkidle
  await page.waitForLoadState('networkidle')
  await page.press('body', 'Tab')

  await expect(page).toHaveURL('/watch/videos?languages=5848&subtitles=529')

  // const filtersList = page.getByTestId('FilterList')
  // Take screenshot
  // await expect(filtersList).toHaveScreenshot('filters-list.png')
})
