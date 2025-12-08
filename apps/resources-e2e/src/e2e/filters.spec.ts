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

  await page.getByTestId('SeeAllVideos').click()

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

  // Choose subtitles language
  await page
    .getByTestId('FilterList')
    .locator('div')
    .filter({
      hasText: 'SubtitlesSearch LanguagesSearch Languages53 languages'
    })
    .getByLabel('Open')
    .click()
  await page
    .getByTestId('FilterList')
    .locator('div')
    .filter({
      hasText: 'SubtitlesSearch LanguagesSearch Languages53 languages'
    })
    .getByLabel('Search Languages')
    .fill('eng')
  await page.getByRole('option', { name: 'English' }).click()

  await page.press('body', 'Tab')

  // Wait for the URL to be updated with filter parameters
  await page.waitForURL(/configure.*languageId.*subtitles/, { timeout: 20000 })

  await expect(page).toHaveURL(
    '/watch/videos?configure%5BruleContexts%5D%5B0%5D=all_videos_page&menu%5BlanguageId%5D=5848&menu%5Bsubtitles%5D=529'
  )
})
