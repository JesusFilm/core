/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'

import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'
import { ProfilePage } from '../../pages/profile-page'
import { Register } from '../../pages/register-Page'

let userEmail = ''

test.describe('verify profile page functionalities', () => {
  test.beforeAll('Register new account', async ({ browser }) => {
    const page = await browser.newPage()
    const landingPage = new LandingPage(page)
    const register = new Register(page)
    await landingPage.goToAdminUrl()
    await register.registerNewAccount() // registering new user account
    userEmail = await register.getUserEmailId() // storing the registered user email id
    console.log(`userName : ${userEmail}`)
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.logInWithCreatedNewUser(userEmail) // login as registered user
  })

  // Verify the user able to add the email notification in email preference page
  test('verify email preference notification page', async ({ page }) => {
    const profilePage = new ProfilePage(page)
    await profilePage.clickProfileIconInNavBar() // clicking the profile icon in navigation list Item
    await profilePage.clickEmailPreferences() // clicking the email preferences button
    await profilePage.verifyEmailPreferencePage() // verifying the page is navigated to preference page
    await profilePage.deactivateAccountNotification() // clicking the account notificatoin toggle and the toggle is deactivated
    await profilePage.activateAccountNotification() // clicking the account notificatoin toggle and the toggle is activated
    await profilePage.clickDoneBtn() // clicking done button
  })

  // Verify the user able to logout the account through logout link
  test('logout', async ({ page }) => {
    const profilePage = new ProfilePage(page)
    await profilePage.clickProfileIconInNavBar() // clicking the profile icon in navigation list Item
    await profilePage.clickLogout() // clicking the logout button
    await profilePage.verifyLogoutToastMsg() // verifying the toast message
    await profilePage.verifyloggedOut() // verifying the user is logged out and the login page is displayed
  })

  // Verify the user able to change language through language options
  test('Verify the user able to change language through language options', async ({
    page
  }) => {
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
})
