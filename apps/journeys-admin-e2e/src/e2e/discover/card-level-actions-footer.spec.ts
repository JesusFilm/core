/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'
import type { BrowserContext, Page } from 'playwright-core'

import { CardLevelActionPage } from '../../pages/card-level-actions'
import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { Register } from '../../pages/register-Page'

let sharedPage: Page | undefined
let sharedContext: BrowserContext | undefined

const getSharedPage = (): Page => {
  if (sharedPage == null)
    throw new Error('Shared authenticated page was not initialized')
  return sharedPage
}

test.describe('verify card level actions - footer', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll('Register new account', async ({ browser }) => {
    sharedContext = await browser.newContext()
    sharedPage = await sharedContext.newPage()
    const landingPage = new LandingPage(sharedPage)
    const register = new Register(sharedPage)
    await landingPage.goToAdminUrl()
    await register.registerNewAccount()
  })

  test.beforeEach(async () => {
    const page = getSharedPage()
    const cardLevelActionPage = new CardLevelActionPage(page)
    const journeyPage = new JourneyPage(page)
    await page.goto('/')
    await journeyPage.clickCreateCustomJourney()
    await cardLevelActionPage.waitUntilJourneyCardLoaded()
    await cardLevelActionPage.clickOnJourneyCard()
    await journeyPage.clickThreeDotBtnOfCustomJourney()
    await journeyPage.clickEditDetailsInThreeDotOptions()
    await journeyPage.enterTitle()
    await journeyPage.clickSaveBtn()
  })

  test.afterAll(async () => {
    if (sharedPage != null) await sharedPage.close()
    if (sharedContext != null) await sharedContext.close()
    sharedPage = undefined
    sharedContext = undefined
  })

  test('Footer properties (Journey) - create, update & delete', async () => {
    const page = getSharedPage()
    const footerTitle = 'Footer Playwright'
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.selectWholeFooterSectionInCard()
    await cardLevelActionPage.expandJourneyAppearance('Reactions')
    await cardLevelActionPage.selectAllTheReactionOptions()
    await cardLevelActionPage.expandJourneyAppearance('Display Title')
    await cardLevelActionPage.enterDisplayTitleForFooter(footerTitle)
    await cardLevelActionPage.expandJourneyAppearance('Hosted By')
    await cardLevelActionPage.clicSelectHostBtn()
    await cardLevelActionPage.clickCreateNewBtn()
    await cardLevelActionPage.enterHostName()
    await cardLevelActionPage.enterLocation()
    await cardLevelActionPage.clickOnJourneyCard()
    await cardLevelActionPage.verifyHostNameAddedInCard()
    await cardLevelActionPage.selectWholeFooterSectionInCard()
    await cardLevelActionPage.expandJourneyAppearance('Chat Widget')
    await cardLevelActionPage.clickMessangerDropDown('WhatsApp')
    await cardLevelActionPage.enterWhatsAppLink()
    await cardLevelActionPage.verifyChatWidgetAddedToCard()
    await cardLevelActionPage.validateFooterTitleAndReactionButtonsInCard(
      footerTitle
    )
  })

  test('Footer properties (WebSite) - create, update & delete', async () => {
    const page = getSharedPage()
    const footerTitle = 'Footer Playwright'
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.selectWholeFooterSectionInCard()
    await cardLevelActionPage.clickJourneyOrWebSiteOptionForFooter('Website')
    await cardLevelActionPage.expandJourneyAppearance('Logo')
    await cardLevelActionPage.clickSelectImageBtn()
    await cardLevelActionPage.selectFirstImageFromGalleryForFooter()
    await cardLevelActionPage.valdiateSelectedImageWithDeleteIcon()
    await cardLevelActionPage.closeToolDrawerForFooterImage()
    await cardLevelActionPage.validateSelectedImageWithEditIcon()
    await cardLevelActionPage.expandJourneyAppearance('Display Title')
    await cardLevelActionPage.enterDisplayTitleForFooter(footerTitle)
    await cardLevelActionPage.expandJourneyAppearance('Menu')
    await cardLevelActionPage.clickSelectIconDropdownForFooterMenu()
    await cardLevelActionPage.selectChevronDownIconForFooter()
    await cardLevelActionPage.selectWholeFooterSectionInCard()
    await cardLevelActionPage.expandJourneyAppearance('Chat Widget')
    await cardLevelActionPage.clickMessangerDropDown('WhatsApp')
    await cardLevelActionPage.enterWhatsAppLink()
    await cardLevelActionPage.verifyChatWidgetAddedToCard()
    await cardLevelActionPage.validateWebsiteFooterSectionInCard(footerTitle)
    await cardLevelActionPage.expandJourneyAppearance('Menu')
    await cardLevelActionPage.clickCreateMenuCardButtonInMenuFooter()
    await cardLevelActionPage.clickleftSideArrowIcon()
    await cardLevelActionPage.validateMenuCardInReactFlow()
  })
})
