import { expect, test } from '@playwright/test'

import { LandingPage } from '../pages/landing-page'
import { LeftNav } from '../pages/left-nav'
import { OnboardingPages } from '../pages/onboarding-pages'
import { LoginPage } from '../pages/login-page'

import users from '../test-data/users.json'

test('Existing user can login and logout successfully', async ({ page }) => { 
  const landingPage = new LandingPage(page)
  const leftNav = new LeftNav(page)
  const loginPage = new LoginPage(page)
  const email = process.env.EMAIL?.toString() || users.email
  const firstAndLastName = process.env.FIRST_AND_LAST_NAME?.toString() || users.first_last_name
  const password = process.env.PASSWORD?.toString() || users.pass

  await landingPage.goToAdminUrl()
  await landingPage.clickSignInWithEmail()

  await loginPage.login(email, password)

  await leftNav.clickProfile()
  await leftNav.testUserDetails(firstAndLastName, email)

  await leftNav.logout()
  await landingPage.signInWithEmailVisible()
 })
