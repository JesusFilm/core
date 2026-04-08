/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'
import type { BrowserContext, Page } from 'playwright-core'

import { JourneyLevelActions } from '../../pages/journey-level-actions-page'
import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { Register } from '../../pages/register-Page'

let currentPage: Page | undefined
let sharedContext: BrowserContext | undefined

const getSharedPage = (): Page => {
  if (currentPage == null)
    throw new Error('Shared authenticated page was not initialized')
  return currentPage
}

const getSharedContext = (): BrowserContext => {
  if (sharedContext == null) {
    throw new Error('Shared authenticated context was not initialized')
  }
  return sharedContext
}

test.describe('Journey level actions - share', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll('Register new account', async ({ browser }) => {
    sharedContext = await browser.newContext()
    currentPage = await sharedContext.newPage()
    const landingPage = new LandingPage(currentPage)
    const register = new Register(currentPage)
    await landingPage.goToAdminUrl()
    await register.registerNewAccount()
    await currentPage.close()
    currentPage = undefined
  })

  test.beforeEach(async () => {
    if (sharedContext == null) {
      throw new Error('Shared authenticated context was not initialized')
    }
    currentPage = await sharedContext.newPage()
    await new JourneyPage(getSharedPage()).gotoDiscoverJourneysPage()
  })

  test.afterEach(async () => {
    if (currentPage != null) {
      await currentPage.close()
      currentPage = undefined
    }
  })

  test.afterAll(async () => {
    if (currentPage != null) await currentPage.close()
    if (sharedContext != null) await sharedContext.close()
    currentPage = undefined
    sharedContext = undefined
  })

  test('Verify copy link icon from Share option dialog in the selected journey page', async () => {
    const page = getSharedPage()
    const context = getSharedContext()
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyLevelActions.setBrowserContext(context)
    await journeyPage.clickCreateCustomJourney()
    await journeyPage.createAndVerifyCustomJourney()
    const journeyName = await journeyPage.getJourneyName()
    await journeyLevelActions.selectCreatedJourney(journeyName)
    await journeyPage.clickShareButtonInJourneyPage()
    await journeyPage.clickCopyIconInShareDialog()
    await journeyLevelActions.verifySnackBarMsg('Link Copied')
  })

  test('Verify Edit Url option from Share option dialog in the selected journey page', async () => {
    const page = getSharedPage()
    const context = getSharedContext()
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyLevelActions.setBrowserContext(context)
    await journeyPage.setBrowserContext(context)
    await journeyPage.clickCreateCustomJourney()
    await journeyPage.createAndVerifyCustomJourney()
    const journeyName = await journeyPage.getJourneyName()
    await journeyLevelActions.selectCreatedJourney(journeyName)
    await journeyPage.clickShareButtonInJourneyPage()
    const urlSlug = await journeyPage.editUrlAndSave()
    await journeyPage.clickCopyIconInShareDialog()
    await journeyLevelActions.verifySnackBarMsg('Link copied')
    await journeyPage.verifyUpdatedUrlSlugIsLoaded(urlSlug)
  })

  test('Verify Embed Journey option from Share option dialog in the selected journey page', async () => {
    const page = getSharedPage()
    const context = getSharedContext()
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyLevelActions.setBrowserContext(context)
    await journeyPage.setBrowserContext(context)
    await journeyPage.clickCreateCustomJourney()
    await journeyPage.createAndVerifyCustomJourney()
    const journeyName = await journeyPage.getJourneyName()
    await journeyLevelActions.selectCreatedJourney(journeyName)
    await journeyPage.clickShareButtonInJourneyPage()
    await journeyPage.clickButtonInShareDialog('Embed Journey')
    const embedCode =
      await journeyPage.validateUrlInEmbedCodeFieldAndReturnEmbedCode()
    await journeyPage.clickDialogActionBtnsInShareDialog('Copy Code')
    await journeyLevelActions.verifySnackBarMsg('Code Copied')
    await journeyPage.validateCopiedValues(embedCode)
    await journeyPage.clickDialogActionBtnsInShareDialog('Cancel')
  })

  test('Verify QR Code option from Share option dialog in the selected journey page', async () => {
    const page = getSharedPage()
    const context = getSharedContext()
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyLevelActions.setBrowserContext(context)
    await journeyPage.setBrowserContext(context)
    await journeyPage.clickCreateCustomJourney()
    await journeyPage.createAndVerifyCustomJourney()
    const journeyName = await journeyPage.getJourneyName()
    await journeyLevelActions.selectCreatedJourney(journeyName)
    await journeyPage.clickShareButtonInJourneyPage()
    await journeyPage.clickButtonInShareDialog('QR Code')
    await journeyPage.clickButtonInShareDialog('Generate Code')
    await journeyPage.downloadQRCodeAsPng()
    await journeyPage.validateDownloadedQrPngFile()
    await journeyPage.clickDownloadDropDownAndSelectCopyShortLink()
    await journeyPage.clickCloseIconForQrCodeDialog()
  })
})
