import { test } from '@playwright/test'
import { chromium } from 'playwright-core'
import { playAudit } from 'playwright-lighthouse'

import { LandingPage } from '../pages/landing-page'
import { TopNav } from '../pages/top-nav'
import { LoginPage } from '../pages/login-page'
import { TemplatePage } from '../pages/template-page'

import users from '../test-data/users.json'

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
test.describe.serial('Running test sequentially', () => {
  test.setTimeout(3 * 60 * 1000)
  test('Landing page - lighthouse test', async () => {
    const browser = await chromium.launch({
      args: ['--remote-debugging-port=9222', '--start-maximized']
    })

    const page = await browser.newPage()
    // Set test time out to 2 minutes as it has to run lighthouse audit
    await page.goto('/')
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
  test('Home page - lighthouse test', async ({}) => {
    const browser = await chromium.launch({
      args: ['--remote-debugging-port=9222', '--start-maximized']
    })
    const page = await browser.newPage()

    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    const topNav = new TopNav(page)

    const email = process.env.EMAIL?.toString() || users.email
    const password = process.env.PASSWORD?.toString() || users.pass
    const teamName = process.env.TEAM_NAME?.toString() || users.team_name

    await landingPage.goToAdminUrl()
    await landingPage.clickSignInWithEmail()

    await loginPage.login(email, password)
    await topNav.teamNameVisible(teamName)

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

  // Set test time out to 2 minutes as it has to run lighthouse audit
  test.setTimeout(3 * 60 * 1000)
  test('Template library landing page - lighthouse test', async ({}) => {
    const browser = await chromium.launch({
      args: ['--remote-debugging-port=9222', '--start-maximized']
    })
    const page = await browser.newPage()

    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    const templatePage = new TemplatePage(page)

    const email = process.env.EMAIL?.toString() || users.email
    const password = process.env.PASSWORD?.toString() || users.pass

    await landingPage.goToAdminUrl()
    await landingPage.clickSignInWithEmail()

    await loginPage.login(email, password)

    await templatePage.seeAllTemplates()
    await templatePage.templateGalleryCarouselVisible()

    await playAudit({
      page,
      config,
      thresholds: {
        performance: 8,
        accessibility: 76,
        'best-practices': 83,
        seo: 73,
        pwa: 67
      },
      port: 9222
    })
    await browser.close()
  })

  // Set test time out to 2 minutes as it has to run lighthouse audit
  test.setTimeout(3 * 60 * 1000)
  test('Template library with filter - lighthouse test', async ({}) => {
    const browser = await chromium.launch({
      args: ['--remote-debugging-port=9222', '--start-maximized']
    })
    const page = await browser.newPage()

    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    const templatePage = new TemplatePage(page)

    const email = process.env.EMAIL?.toString() || users.email
    const password = process.env.PASSWORD?.toString() || users.pass
    const teamName = process.env.TEAM_NAME?.toString() || users.team_name

    await landingPage.goToAdminUrl()
    await landingPage.clickSignInWithEmail()

    await loginPage.login(email, password)

    await templatePage.seeAllTemplates()
    await templatePage.templateGalleryCarouselVisible()

    await templatePage.clickTemplateCategory('Acceptance')
    await templatePage.correctTemplateCategoryFiltered('Acceptance')

    await playAudit({
      page,
      config,
      thresholds: {
        performance: 17,
        accessibility: 81,
        'best-practices': 83,
        seo: 73,
        pwa: 67
      },
      port: 9222
    })
    await browser.close()
  })

  // Set test time out to 2 minutes as it has to run lighthouse audit
  test.setTimeout(3 * 60 * 1000)
  test('Template landing page - lighthouse test', async ({}) => {
    const browser = await chromium.launch({
      args: ['--remote-debugging-port=9222', '--start-maximized']
    })
    const page = await browser.newPage()

    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    const templatePage = new TemplatePage(page)

    const email = process.env.EMAIL?.toString() || users.email
    const password = process.env.PASSWORD?.toString() || users.pass
    const teamName = process.env.TEAM_NAME?.toString() || users.team_name

    await landingPage.goToAdminUrl()
    await landingPage.clickSignInWithEmail()

    await loginPage.login(email, password)

    await templatePage.seeAllTemplates()
    await templatePage.templateGalleryCarouselVisible()

    await templatePage.clickTemplateCategory('Acceptance')
    await templatePage.correctTemplateCategoryFiltered('Acceptance')

    await templatePage.clickTemplate('Acceptance')
    await templatePage.correctTemplateDisplayed("Lyuba's Template")

    await playAudit({
      page,
      config,
      thresholds: {
        performance: 18,
        accessibility: 81,
        'best-practices': 83,
        seo: 73,
        pwa: 44
      },
      port: 9222
    })
    await browser.close()
  })
})
