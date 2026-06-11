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

  const filterList = page.getByTestId('FilterList')

  const languageSection = filterList.locator('div').filter({
    hasText: 'LanguagesSearch LanguagesSearch Languages2000+ languages'
  })

  const subtitlesSection = filterList.locator('div').filter({
    hasText: 'SubtitlesSearch LanguagesSearch Languages61 languages'
  })

  // Choose audio language
  await languageSection.getByLabel('Open').click()
  const languageSearchInput = languageSection.getByLabel('Search Languages')
  await languageSearchInput.fill('telu')
  await languageSearchInput.press('ArrowDown')
  await languageSearchInput.press('Enter')

  // Choose subtitles language
  await subtitlesSection.getByLabel('Open').click()
  const subtitlesSearchInput = subtitlesSection.getByLabel('Search Languages')
  await subtitlesSearchInput.fill('English')
  await page.getByRole('option', { name: 'English', exact: true }).click()

  await page.press('body', 'Tab')

  await expect
    .poll(() => {
      const url = new URL(page.url())
      return {
        ruleContext: url.searchParams.get('configure[ruleContexts][0]'),
        filters: url.searchParams.get('configure[filters]'),
        languageId: url.searchParams.get('menu[languageId]'),
        subtitles: url.searchParams.get('menu[subtitles]')
      }
    })
    .toEqual({
      ruleContext: 'all_videos_page',
      filters:
        'NOT restrictViewPlatforms:watch AND published:true AND videoPublished:true',
      languageId: '5848',
      subtitles: '529'
    })
})
