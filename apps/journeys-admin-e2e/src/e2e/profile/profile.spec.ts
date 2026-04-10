/* eslint-disable playwright/expect-expect */
import type { BrowserContext, Page } from 'playwright-core'

import {
  newContextWithWorkerStorageState,
  test
} from '../../fixtures/workerAuth'
import { ProfilePage } from '../../pages/profile-page'

let currentPage: Page | undefined
let sharedContext: BrowserContext | undefined

const getSharedPage = (): Page => {
  if (currentPage == null)
    throw new Error('Shared authenticated page was not initialized')
  return currentPage
}

test.describe('verify profile page functionalities', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(
    'Register new account',
    async ({ browser, workerStorageState }) => {
      sharedContext = await newContextWithWorkerStorageState(
        browser,
        workerStorageState
      )
    }
  )

  test.beforeEach(async () => {
    if (sharedContext == null) {
      throw new Error('Shared authenticated context was not initialized')
    }
    currentPage = await sharedContext.newPage()
    await getSharedPage().goto('/')
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

  // Verify the user able to add the email notification in email preference page
  test('verify email preference notification page', async () => {
    const page = getSharedPage()
    const profilePage = new ProfilePage(page)
    await profilePage.clickProfileIconInNavBar() // clicking the profile icon in navigation list Item
    await profilePage.clickEmailPreferences() // clicking the email preferences button
    await profilePage.verifyEmailPreferencePage() // verifying the page is navigated to preference page
    await profilePage.deactivateAccountNotification() // clicking the account notificatoin toggle and the toggle is deactivated
    await profilePage.activateAccountNotification() // clicking the account notificatoin toggle and the toggle is activated
    await profilePage.clickDoneBtn() // clicking done button
  })

  // Verify the user able to change language through language options
  test('Verify the user able to change language through language options', async () => {
    const page = getSharedPage()
    const profilePage = new ProfilePage(page)
    await profilePage.clickProfileIconInNavBar() // clicking the profile icon in navigation list Item
    await profilePage.clickLanguageOption() // clicking language option
    await profilePage.enterLanguage('español') // selecting language in the edit language popup
    await profilePage.verifySelectedLanguageUpdatedInChangeLangPopup() // verifying seleceted language is updated in the chnage language popuo
    await profilePage.popupCloseBtn() // closing the change language popup
    await profilePage.verifySelectedLanguageUpdatedOnTheSite() // verifying selected language is updated on the whole site
    await profilePage.clickLanguageOption() // clicking language option
    await profilePage.enterLanguage('English') // selecting language in the edit language popup
    await profilePage.popupCloseBtn() // closing the change language popup
  })

  // Verify the user able to logout the account through logout link
  test('logout', async () => {
    const page = getSharedPage()
    const profilePage = new ProfilePage(page)
    await profilePage.clickProfileIconInNavBar() // clicking the profile icon in navigation list Item
    await profilePage.clickLogout() // clicking the logout button
    await profilePage.verifyloggedOut() // verifying the user is logged out and the login page is displayed
  })
})
