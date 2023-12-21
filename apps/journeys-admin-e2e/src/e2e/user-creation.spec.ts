import { test } from '@playwright/test'
import { chromium } from 'playwright-core'
import { playAudit } from 'playwright-lighthouse'

import { LandingPage } from '../pages/landing-page'
import { LeftNav } from '../pages/left-nav'
import { TopNav } from '../pages/top-nav'
import { OnboardingPages } from '../pages/onboarding-pages'
import { LoginPage } from '../pages/login-page'
import { TemplatePage } from '../pages/template-page'

import users from '../test-data/users.json'

// test.describe.serial('Running test sequentially', () => {
// Test that new user can be created successfully
test('Create a new user', async ({ page }) => {
  test.setTimeout(60000)
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

  await landingPage.goToAdminUrl()
  await landingPage.clickSignInWithEmail()

  await onboardingPages.createUser(email, firstAndLastName, password)
  await onboardingPages.fillOnboardingForm(teamName, legalName)

  await leftNav.clickProfile()
  await leftNav.testUserDetails(firstAndLastName, email)
  await leftNav.logout()
  await landingPage.signInWithEmailVisible()
})

// Already created user should be able to login successfully
test('Existing user can login and logout successfully', async ({ page }) => {
  const landingPage = new LandingPage(page)
  const leftNav = new LeftNav(page)
  const loginPage = new LoginPage(page)
  const email = process.env.EMAIL?.toString() || users.email
  const firstAndLastName =
    process.env.FIRST_AND_LAST_NAME?.toString() || users.first_last_name
  const password = process.env.PASSWORD?.toString() || users.pass

  await landingPage.goToAdminUrl()
  await landingPage.clickSignInWithEmail()

  await loginPage.login(email, password)

  await leftNav.clickProfile()
  await leftNav.testUserDetails(firstAndLastName, email)
  await leftNav.logout()

  await landingPage.signInWithEmailVisible()
})
