import { test } from '../fixtures/authenticated'
import { JourneyPage } from '../pages/journey-page'

test('admin can create a journey', async ({ authedPage }) => {
  test.setTimeout(120000)
  const journeyPage = new JourneyPage(authedPage)
  await journeyPage.clickCreateCustomJourney()
  await journeyPage.createAndVerifyCustomJourney()
})
