import { expect, test } from '@playwright/test'

import { LandingPage } from '../pages/landing-page'
import { LeftNav } from '../pages/left-nav'
import { OnboardingPages } from '../pages/onboarding-pages'

test('Create a new user', async ({ page }) => {
  test.setTimeout(60000)

  const landingPage = new LandingPage(page)
  const leftNav = new LeftNav(page)
  const onboardingPages = new OnboardingPages(page)

  const now = new Date()
  const epochTime = now.getTime()
  const email = `playwright.tester${epochTime}@example.com`
  const firstAndLastName = `FirstName LastName-${epochTime}`
  const password = `playwright-${epochTime}`
  const teamName = `Team Name-${epochTime}`
  const legalName = `Legal Name-${epochTime}`

  await landingPage.goToAdminUrl()
  await landingPage.clickSignInWithEmail()

  await onboardingPages.createUser(email, firstAndLastName, password)
  await onboardingPages.fillOnboardingForm(teamName, legalName)

  await leftNav.clickProfile()
  expect(await leftNav.getName()).toBe(firstAndLastName)
  expect(await leftNav.getEmail()).toBe(email)

  await leftNav.logout()
  const isLandingPageVisible = await landingPage.isLandingPage()
  expect(isLandingPageVisible).toBe(true)
})
