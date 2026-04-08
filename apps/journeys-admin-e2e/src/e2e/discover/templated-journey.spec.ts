/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'
import type { BrowserContext, Page } from 'playwright-core'

import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { Register } from '../../pages/register-Page'

let userEmail = ''
let sharedPage: Page | undefined
let sharedContext: BrowserContext | undefined

const getSharedPage = (): Page => {
  if (sharedPage == null)
    throw new Error('Shared authenticated page was not initialized')
  return sharedPage
}

test.describe('verify see link and see all templates', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll('Register new account', async ({ browser }) => {
    sharedContext = await browser.newContext()
    sharedPage = await sharedContext.newPage()
    const landingPage = new LandingPage(sharedPage)
    const register = new Register(sharedPage)
    await landingPage.goToAdminUrl()
    await register.registerNewAccount() // registering new user account
    userEmail = await register.getUserEmailId() // storing the registered user email id
    console.log(`userEmail : ${userEmail}`)
  })

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
