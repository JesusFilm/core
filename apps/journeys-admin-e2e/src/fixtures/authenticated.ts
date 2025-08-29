import { test as base } from '@playwright/test'
import type { Page } from 'playwright-core'

import { LoginPage } from '../pages/login-page'

export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    await page.goto('/')
    const loginPage = new LoginPage(page)
    await loginPage.login('admin')
    await use(page)
  }
})

export const expect = test.expect
