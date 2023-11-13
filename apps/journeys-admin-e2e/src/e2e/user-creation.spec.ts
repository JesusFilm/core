import { expect, test } from '@playwright/test'

import { LandingPage } from '../pages/landing-page'
import { LeftNav } from '../pages/left-nav'
import { TopNav } from '../pages/top-nav'
import { OnboardingPages } from '../pages/onboarding-pages'

/* 
Test that a user can create an account and logout
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
})
