import { expect, test } from '@playwright/test'

/* 
Test a Filters:

Navigate to home page 
Click on 'Seel All' button
Take screenshot
Select 'Telugu' audion & 'English' subtitles
Check the URL has correct parameters
Take a screenshot of just filters list
*/
test('Filters', async ({ page }) => {
  await page.goto('/watch')

  // Get and log the current URL
  const url = page.url()
  console.log('Current URL:', url)

  await page.getByTestId('SeeAllVideos').click()

  // all tiles aren't loading. Change it to use events when that is implemented in the code
  // eslint-disable-next-line
  await page.waitForTimeout(8 * 1000)

  // Take screenshot
  await expect(page).toHaveScreenshot('see-all-landing.png', {
    animations: 'disabled',
    fullPage: true
  })

  // Choose audio language
  await page
    .getByTestId('FilterList')
    .locator('div')
    .filter({
      hasText: 'LanguagesSearch LanguagesSearch Languages2000+ languages'
    })
    .getByLabel('Open')
    .click()
  await page.getByRole('option', { name: 'Telugu తెలుగు' }).click()

  // Choose subtittles language
  await page.getByTestId('filter-item-subtitles').click()
  await page
    .getByTestId('FilterList')
    .locator('div')
    .filter({
      hasText: 'SubtitlesSearch LanguagesSearch Languages54 languages'
    })
    .getByLabel('Open')
    .click()
  await page.getByRole('option', { name: 'English', exact: true }).click()

  // check it's navigated to the correct URL
  await expect(page).toHaveURL('/watch/videos?language=5848&subtitle=529')

  const filtersList = page.getByTestId('FilterList')

  // Take screenshot
  await expect(filtersList).toHaveScreenshot('filters-list.png')
})
