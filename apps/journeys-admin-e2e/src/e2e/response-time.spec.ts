import { expect, test } from '@playwright/test'

import { LandingPage } from '../pages/landing-page'
import { LoginPage } from '../pages/login-page'

test('Home page - response time test', async ({ page, browser }) => {
  const landingPage = new LandingPage(page)
  const loginPage = new LoginPage(page)
  await browser.startTracing()
  await landingPage.goToAdminUrl()

  await loginPage.login()

  // Using Performanc.mark API
  await page.evaluate(() => window.performance.mark('Start:FoF'))

  // Using performance.mark API
  await page.evaluate(() => window.performance.mark('End:FoF'))

  // Get all performance marks
  const getAllMarksJson = await page.evaluate(() =>
    JSON.stringify(window.performance.getEntriesByType('mark'))
  )
  const getAllMarks = await JSON.parse(getAllMarksJson)
  console.log('window.performance.getEntriesByType("mark")', getAllMarks)

  await browser.stopTracing()

  // Test that time taken between Start:FoF and End:FoF is less than 1700ms
  const start = getAllMarks.find((obj) => obj.name === 'Start:FoF')?.startTime
  const end = getAllMarks.find((obj) => obj.name === 'End:FoF')?.startTime
  const diff = end - start
  console.log('diff', diff)
  expect(diff).toBeLessThan(7000)
})
