import { expect, test } from '@playwright/test'

import { getEmail, getUser } from '../../framework/helpers'
import { LandingPage } from '../../pages/landing-page'
import { LeftNav } from '../../pages/left-nav'
import { LoginPage } from '../../pages/login-page'

// Already created user should be able to login successfully
test.fixme(
  'Existing user can login and logout successfully',
  async ({ page }) => {
    const landingPage = new LandingPage(page)
    const leftNav = new LeftNav(page)
    const loginPage = new LoginPage(page)

    await landingPage.goToAdminUrl()

    await loginPage.login()

    await leftNav.clickProfile()
    const email = await getEmail()
    expect(await leftNav.getEmail()).toBe(email)
    const firstAndLastName = await getUser()
    expect(await leftNav.getName()).toBe(firstAndLastName)
    await leftNav.logout()

    const isLandingPageVisible = await landingPage.isLandingPage()
    expect(isLandingPageVisible).toBe(true)
  }
)
