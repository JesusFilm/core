import { expect, test } from '@playwright/test'

import { LandingPage } from '../pages/landing-page'
import { LeftNav } from '../pages/left-nav'
import { TopNav } from '../pages/top-nav'
import { OnboardingPages } from '../pages/onboarding-pages'

test.describe('User creation', () => {
  /* 
Test that new user can be created successfully
*/
test('User creation and logout', async ({ page }) => {
  const landingPage = new LandingPage(page)
  const leftNav = new LeftNav(page)
  const topNav = new TopNav(page)
  const onboardingPages = new OnboardingPages(page)

  const now = new Date()
  const epochTime = now.getTime()
  const email = `playwright.tester${epochTime}@example.com`
  const firstAndLastName = `FirstName LastName-${epochTime}`
  const password = `playwright-${epochTime}`
  const teamName = `Team Name-${epochTime}`
  const legalName = `Legal Name-${epochTime}`

  await landingPage.open()
  await landingPage.clickSignInWithEmail()

  await onboardingPages.createUser(email, firstAndLastName, password)
  await onboardingPages.fillOnboardingForm(teamName, legalName)

  await topNav.clickTeamName(teamName)
  await topNav.testTeamName(teamName)

  await leftNav.clickProfile()
  await leftNav.testUserDetails(firstAndLastName, email)

  await leftNav.logout()
  await landingPage.isSignInWithEmailVisible()
})

test('Existing user can login and logout successfully', async ({ page }) => { 
  const landingPage = new LandingPage(page)
  const leftNav = new LeftNav(page)
  const onboardingPages = new OnboardingPages(page)

  await landingPage.open()
  await landingPage.clickSignInWithEmail()

  await onboardingPages.fillEmail(process.env.EMAIL)
  await onboardingPages.clickNextButton()
  await onboardingPages.fillPassword(process.env.PASSWORD)
  await onboardingPages.clickSubmitButton()
  await leftNav.clickProfile()
  await leftNav.testUserDetails(process.env.FIRST_AND_LAST_NAME, process.env.EMAIL)

  await leftNav.logout()
  await landingPage.isSignInWithEmailVisible()
 })
})
