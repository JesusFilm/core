import { test as base } from '@playwright/test'
import type { Page } from 'playwright-core'

import { getBaseUrl } from '../framework/helpers'
import { LoginPage } from '../pages/login-page'

export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    const baseURL = await getBaseUrl()
    await page.goto(baseURL)
    const loginPage = new LoginPage(page)
    await loginPage.login('admin')
    await use(page)
  }
})

export const expect = test.expect
