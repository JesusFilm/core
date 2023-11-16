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
import { template } from 'cypress/types/lodash'

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
  
  /*
  LightHouse audit test
  */
  test('Home page - lighthouse test', async ( { }) => {
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
    
    // Set test time out to 2 minutes as it has to run lighthouse audit
    test.setTimeout(2 * 60 * 1000)
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
  })

  test('Template library landing page - lighthouse test', async ( { }) => {
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
    
    // Set test time out to 2 minutes as it has to run lighthouse audit
    test.setTimeout(2 * 60 * 1000)
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

  test('Template library with filter - lighthouse test', async ( { }) => {
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
    
    // Set test time out to 2 minutes as it has to run lighthouse audit
    test.setTimeout(2 * 60 * 1000)
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
  
  test('Template landing page - lighthouse test', async ( { }) => {
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
    
    // Set test time out to 2 minutes as it has to run lighthouse audit
    test.setTimeout(2 * 60 * 1000)
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
  
  // test('Create custom journey', async ( { page }) => {
  //   const landingPage = new LandingPage(page)
  //   const loginPage = new LoginPage(page)
  //   const topNav = new TopNav(page)
  //   const templatePage = new TemplatePage(page)
    

  //   const email = process.env.EMAIL?.toString() || users.email
  //   const password = process.env.PASSWORD?.toString() || users.pass
  //   const teamName = process.env.TEAM_NAME?.toString() || users.team_name
  
  //   await landingPage.goToAdminUrl()
  //   await landingPage.clickSignInWithEmail()
  
  //   await loginPage.login(email, password)
  //   await topNav.teamNameVisible(teamName)
  //   await templatePage.createCustomJourney()
  // })

  // test('Template details page - lighthouse test', async ( { }) => {
  //   const browser = await chromium.launch({
  //     args: ['--remote-debugging-port=9222', '--start-maximized']
  //   })
  //   const page = await browser.newPage()
  //   const config = {
  //     extends: 'lighthouse:default',
  //     settings: {
  //       formFactor: 'desktop',
  //       screenEmulation: {
  //         mobile: false,
  //         width: 1350,
  //         height: 940,
  //         deviceScaleFactor: 1,
  //         disabled: false
  //       }
  //     }
  //   }
    
  //   // Set test time out to 2 minutes as it has to run lighthouse audit
  //   // test.setTimeout(2 * 60 * 1000)
  //   const landingPage = new LandingPage(page)
  //   const loginPage = new LoginPage(page)
  //   const templatePage = new TemplatePage(page)
    

  //   const email = process.env.EMAIL?.toString() || users.email
  //   const password = process.env.PASSWORD?.toString() || users.pass
  //   const teamName = process.env.TEAM_NAME?.toString() || users.team_name
  
  //   await landingPage.goToAdminUrl()
  //   await landingPage.clickSignInWithEmail()
  
  //   await loginPage.login(email, password)

  //   await templatePage.seeAllTemplates()
  //   await templatePage.templateGalleryCarouselVisible()

  //   await templatePage.clickTemplateCategory('Acceptance')
  //   await templatePage.correctTemplateCategoryFiltered('Acceptance')

  //   await templatePage.clickTemplate('Acceptance')
  //   await templatePage.correctTemplateDisplayed("Lyuba's Template")

  //   await templatePage.useTemplate(teamName)
  //   await templatePage.templateDetailsPageDisplayed("Journey")

  //   await playAudit({
  //     page,
  //     config,
  //     thresholds: {
  //       performance: 18,
  //       accessibility: 81,
  //       'best-practices': 83,
  //       seo: 73,
  //       pwa: 44
  //     },
  //     port: 9222
  //   })
  //   await browser.close()
  // })  
})