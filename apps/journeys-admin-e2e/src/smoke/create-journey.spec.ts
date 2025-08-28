import { test } from '../fixtures/authenticated'
import { JourneyPage } from '../pages/journey-page'

test('admin can create a journey', async ({ authedPage }) => {
  const journeyPage = new JourneyPage(authedPage)
  await journeyPage.clickCreateCustomJourney()
  await journeyPage.createAndVerifyCustomJourney()
})
