import { expect, test } from '@playwright/test'

import { LandingPage } from '../pages/landing-page'
import { LeftNav } from '../pages/left-nav'
import { OnboardingPages } from '../pages/onboarding-pages'

test('Existing user can login and logout successfully', async ({ page }) => { 
  const landingPage = new LandingPage(page)
  const leftNav = new LeftNav(page)
  const onboardingPages = new OnboardingPages(page)
  const email = process.env.EMAIL?.toString() || ''
  const firstAndLastName = process.env.FIRST_AND_LAST_NAME?.toString() || ''
  const password = process.env.PASSWORD?.toString() || ''
  console.log(email, firstAndLastName, password)

  await landingPage.open()

  await landingPage.clickSignInWithEmail()
  await onboardingPages.fillExistingEmail(email)
  await onboardingPages.clickNextButton()
  await onboardingPages.fillExistingPassword(password)
  await onboardingPages.clickSubmitButton()
  await leftNav.clickProfile()
  await leftNav.testUserDetails(firstAndLastName, email)

  await leftNav.logout()
  await landingPage.isSignInWithEmailVisible()
 })
