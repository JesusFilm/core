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

test('Create custom journey', async ({ page }) => {
  const landingPage = new LandingPage(page)
  const loginPage = new LoginPage(page)
  const topNav = new TopNav(page)
  const templatePage = new TemplatePage(page)

  const email = process.env.EMAIL?.toString() || users.email
  const password = process.env.PASSWORD?.toString() || users.pass
  const teamName = process.env.TEAM_NAME?.toString() || users.team_name

  await landingPage.goToAdminUrl()
  await landingPage.clickSignInWithEmail()

  await loginPage.login(email, password)
  await topNav.teamNameVisible(teamName)
  await templatePage.createCustomJourney()
})
