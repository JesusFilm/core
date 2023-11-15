import { test } from '@playwright/test'
import { chromium } from 'playwright-core'
import { playAudit } from 'playwright-lighthouse'

import { LandingPage } from '../pages/landing-page'
import { LeftNav } from '../pages/left-nav'
import { TopNav } from '../pages/top-nav'
import { OnboardingPages } from '../pages/onboarding-pages'
import { LoginPage } from '../pages/login-page'

import users from '../test-data/users.json'

test.describe.serial('Running test sequentially', () => {

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

  // Test team name is correct
  test('Test team name recorded correctly', async ({ page }) => { 
    const landingPage = new LandingPage(page)
    const leftNav = new LeftNav(page)
    const loginPage = new LoginPage(page)
    const topNav = new TopNav(page)

    const email = process.env.EMAIL?.toString() || users.email
    const password = process.env.PASSWORD?.toString() || users.pass
    const teamName = process.env.TEAM_NAME?.toString() || users.team_name
  
    await landingPage.goToAdminUrl()
    await landingPage.clickSignInWithEmail()
  
    await loginPage.login(email, password)
  
    await topNav.clickTeamName(teamName)
    await topNav.testTeamName(teamName)
  })  
  
  /*
  LightHouse audit test
  */
  test('Homepage', async ( { }) => {
    const browser = await chromium.launch({
      args: ['--remote-debugging-port=9222', '--start-maximized']
    })
    const page = await browser.newPage()
    const config = {
      extends: 'lighthouse:default',
      settings: {
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false
        }
      }
    }
    
    // Set test time out to 4 minutes as it has to run lighthouse audit
    test.setTimeout(4 * 60 * 1000)
    const landingPage = new LandingPage(page)

    await landingPage.goToAdminUrl()
    await playAudit({
      page,
      config,
      thresholds: {
        performance: 36,
        accessibility: 98,
        'best-practices': 83,
        seo: 82,
        pwa: 67
      },
      reports: {
        formats: { html: true },
        name: 'lighthouse-report'
        // Uncomment the line below to generate a new report every time
        // directory: 'lighthouse-report' + Date.now().toString()
      },
      port: 9222
    })
  })
})
