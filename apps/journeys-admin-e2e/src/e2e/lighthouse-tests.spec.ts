/* eslint-disable playwright/expect-expect */
import { expect, test } from '@playwright/test'
import { chromium } from 'playwright-core'
import { playAudit } from 'playwright-lighthouse'

import { getTeamName } from '../framework/helpers'
import { LandingPage } from '../pages/landing-page'
import { LoginPage } from '../pages/login-page'
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
      accessibility: 90,
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
  const loginPage = new LoginPage(page)
  const topNav = new TopNav(page)

  await landingPage.goToAdminUrl()
  await landingPage.clickSignInWithEmail()

  await loginPage.login()

  // Get team name from env vars compare it with actual team name in the app
  const teamName = await getTeamName()
  await topNav.clickTeamName(teamName)
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
