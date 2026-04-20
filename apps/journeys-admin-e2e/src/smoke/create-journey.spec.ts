import {
  expect,
  newContextWithWorkerStorageState,
  test
} from '../fixtures/workerAuth'
import { JourneyPage } from '../pages/journey-page'

test('user can create a journey', async ({ browser, workerStorageState }) => {
  const ctx = await newContextWithWorkerStorageState(
    browser,
    workerStorageState
  )
  try {
    const page = await ctx.newPage()
    await page.goto('/')
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney()
    await journeyPage.createAndVerifyCustomJourney()
    await expect(
      page.getByRole('button', { name: 'Create Custom Journey' })
    ).toBeEnabled()
  } finally {
    await ctx.close()
  }
})
