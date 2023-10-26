import { expect, test } from '@playwright/test';

test("Capture performance traces by marking actions using Performance API", async ({ page, browser }) => {
    await page.goto("https://your.nextstep.is/")

    // fact or fiction page - click on on fact or fiction
    await page.click('a[href="/fact-or-fiction"]')

    console.log("========== Start Tracing Perf ===========")
    // Using Performanc.mark API
    await page.evaluate(() => (window.performance.mark('Perf:Started')))
        
    // test that user actually navigated to the choosen journey
    await expect(page).toHaveURL(/.*fact-or-fiction/)
    await expect(page).toHaveScreenshot('fact-or-fiction.png', {
        animations: 'disabled',
        fullPage: true
      })

    // Using performance.mark API
    await page.evaluate(() => (window.performance.mark('Perf:Ended')))

    // Performance measure
    await page.evaluate(() => (window.performance.measure("overall", "Perf:Started", "Perf:Ended")))

    // To get all performance marks
    const getAllMarksJson = await page.evaluate(() => (JSON.stringify(window.performance.getEntriesByType("mark"))))
    const getAllMarks = await JSON.parse(getAllMarksJson)
    console.log('window.performance.getEntriesByType("mark")', getAllMarks)

    // To get all performance measures of Google
    const getAllMeasuresJson = await page.evaluate(() => (JSON.stringify(window.performance.getEntriesByType("measure"))))
    const getAllMeasures = await JSON.parse(getAllMeasuresJson)
    console.log('window.performance.getEntriesByType("measure")', getAllMeasures)
    await expect(page).toHaveURL(/.*fact-or-fiction/)
    console.log("======= Stop Tracing ============")
    await browser.stopTracing()
    expect(getAllMarks).not.toBeNull()

    // expect overall duration is less than or equals to 700 ms

})