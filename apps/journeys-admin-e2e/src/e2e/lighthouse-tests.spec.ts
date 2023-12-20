/* eslint-disable playwright/expect-expect */
import { expect, test } from '@playwright/test'
import { chromium } from 'playwright-core'
import { playAudit } from 'playwright-lighthouse'

import { LandingPage } from '../pages/landing-page'
import { OnboardingPages } from '../pages/onboarding-pages'
import { TopNav } from '../pages/top-nav'

/*
  LightHouse audit test
*/
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

test.setTimeout(3 * 60 * 1000)

test('Landing page - lighthouse test', async () => {
  const browser = await chromium.launch({
    args: ['--remote-debugging-port=9222', '--start-maximized']
  })

  const page = await browser.newPage()
  const landingPage = new LandingPage(page)
  // Set test time out to 2 minutes as it has to run lighthouse audit
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
    // reports: {
    //   formats: { html: true },
    //   name: 'lighthouse-report',
    //   // Uncomment the line below to generate a new report every time
    //   directory: 'lighthouse-report' + Date.now().toString()
    // },
    port: 9222
  })
  await browser.close()
})

// Set test time out to 2 minutes as it has to run lighthouse audit
test.setTimeout(3 * 60 * 1000)

test('Home page - lighthouse test', async () => {
  const browser = await chromium.launch({
    args: ['--remote-debugging-port=9222', '--start-maximized']
  })
  const page = await browser.newPage()

  const landingPage = new LandingPage(page)
  const onboardingPages = new OnboardingPages(page)
  const topNav = new TopNav(page)

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
  
  expect(await topNav.getTeamName()).toBe(teamName)

  await playAudit({
    page,
    config,
    thresholds: {
      performance: 46,
      accessibility: 98,
      'best-practices': 83,
      seo: 82,
      pwa: 67
    },
    port: 9222
  })
  await browser.close()
})