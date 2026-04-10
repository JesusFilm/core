/* eslint-disable playwright/expect-expect */
import type { BrowserContext, Page } from 'playwright-core'

import {
  newContextWithWorkerStorageState,
  test
} from '../../fixtures/workerAuth'
import { JourneyPage } from '../../pages/journey-page'

let sharedPage: Page | undefined
let sharedContext: BrowserContext | undefined

const getSharedPage = (): Page => {
  if (sharedPage == null)
    throw new Error('Shared authenticated page was not initialized')
  return sharedPage
}

test.describe('verify see link and see all templates', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(
    'Register new account',
    async ({ browser, workerStorageState }) => {
      sharedContext = await newContextWithWorkerStorageState(
        browser,
        workerStorageState
      )
      sharedPage = await sharedContext.newPage()
    }
  )

  test.beforeEach(async () => {
    await getSharedPage().goto('/')
  })

  test.afterAll(async () => {
    if (sharedPage != null) await sharedPage.close()
    if (sharedContext != null) await sharedContext.close()
    sharedPage = undefined
    sharedContext = undefined
  })

  // Assert that See all link & See all templates button have a href to /templates
  test('Assert that See all link & See all templates button have a href to /templates', async ({}) => {
    const page = getSharedPage()
    const journeyPage = new JourneyPage(page)
    await journeyPage.verifySeeLinkHrefAttributeBesideUseTemplate() // beside the 'use template' drawer name in discover page, verify the 'see link' have href attribute with '/templates' value
    await journeyPage.verifySeeAllTemplateBelowUseTemplate() // at the bottom of  the 'use template' drawer, verify the 'See all templates' have href attribute with '/templates' value
  })
})
