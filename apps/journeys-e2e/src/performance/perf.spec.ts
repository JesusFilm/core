import { expect, test } from '@playwright/test'

test('Capture performance traces by marking actions using Performance API', async ({
  page,
  browser
}) => {
  await page.goto('https://your.nextstep.is/')

  // Click on on fact or fiction
  await page.click('a[href="/fact-or-fiction"]')

  console.log('========== Start Tracing Perf ===========')
  await browser.startTracing()
  // Using Performanc.mark API
  await page.evaluate(() => window.performance.mark('Start:FoF'))

  // test that user actually navigated to the choosen journey
  await expect(page).toHaveURL(/.*fact-or-fiction/)
  await expect(page).toHaveScreenshot('fact-or-fiction.png', {
    fullPage: true
  })

  // Using performance.mark API
  await page.evaluate(() => window.performance.mark('End:FoF'))

  console.log('======= Stop Tracing ============')
  await browser.stopTracing()

  // To get all performance marks
  const getAllMarksJson = await page.evaluate(() =>
    JSON.stringify(window.performance.getEntriesByType('mark'))
  )
  const getAllMarks = await JSON.parse(getAllMarksJson)
  console.log('window.performance.getEntriesByType("mark")', getAllMarks)
  expect(getAllMarks.length).toBeGreaterThan(0)

  // Test that time taken between Start:FoF and End:FoF is less than acceptable threshold
  const start = getAllMarks.find((obj) => obj.name === 'Start:FoF')?.startTime
  const end = getAllMarks.find((obj) => obj.name === 'End:FoF')?.startTime
  const diff = end - start
  console.log('diff: ', diff)
  expect(diff).toBeLessThan(1000)
})
