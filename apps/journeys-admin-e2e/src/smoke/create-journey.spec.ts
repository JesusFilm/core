import { test } from '../fixtures/workerAuth'
import { JourneyPage } from '../pages/journey-page'

test('user can create a journey', async ({ browser, workerStorageState }) => {
  const ctx = await browser.newContext({ storageState: workerStorageState })
  const page = await ctx.newPage()
  await page.goto('/')
  const journeyPage = new JourneyPage(page)
  await journeyPage.clickCreateCustomJourney()
  await journeyPage.createAndVerifyCustomJourney()
  await ctx.close()
})
