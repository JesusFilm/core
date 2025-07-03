import { expect, test } from '@playwright/test'

/*  
NS Admin: Monitoring
https://www.checklyhq.com/docs/cli/
*/

// Set 1 minutes timeout for this monitoring test
test.setTimeout(60000)

/**
 * @check
 * @name NS Admin Monitoring
 * @retries 8 // Will retry the test 8 times
 * @retryInterval 10 // Will wait 10 seconds between retries
 * @maxRetryTime 600 // Will stop retrying after 10 minutes
 */
test('NS Admin Monitoring: Check user can login and see the dashboard', async ({
  browser
}) => {
  if (!process.env.PLAYWRIGHT_EMAIL || !process.env.PLAYWRIGHT_PASSWORD) {
    throw new Error(
      'Email & password environment variables are not set in checkly.'
    )
  }

  const email = process.env.PLAYWRIGHT_EMAIL
  const password = process.env.PLAYWRIGHT_PASSWORD
  const timeout = 60000
  const startTime = Date.now()
  const stepTiming: { [key: string]: number } = {}

  // Declare variables that need cleanup
  let context: any = null
  let page: any = null
  const previewPage: any = null

  try {
    context = await browser.newContext()
    page = await context.newPage()

    // Step 1: Navigate to login page
    const loginStart = Date.now()
    await page.goto('https://admin.nextstep.is/', { timeout })
    stepTiming['navigation'] = Date.now() - loginStart

    // Step 2: Login
    const authStart = Date.now()
    await page
      .getByPlaceholder('Enter your email address here')
      .click({ timeout })
    await page
      .getByPlaceholder('Enter your email address here')
      .fill(email, { timeout })
    await page
      .getByRole('button', { name: 'Continue with email' })
      .click({ timeout })
    await page.getByPlaceholder('Enter Password').click({ timeout })
    await page.getByPlaceholder('Enter Password').fill(password, { timeout })
    await page.getByRole('button', { name: 'Sign In' }).click({ timeout })
    stepTiming['authentication'] = Date.now() - authStart

    // Step 3: Wait for and verify dashboard load
    const dashboardStart = Date.now()
    await expect(page.getByTestId('NavigationListItemDiscover')).toBeVisible({
      timeout
    })
    stepTiming['dashboard_load'] = Date.now() - dashboardStart

    // Log monitoring metrics
    const totalDuration = Date.now() - startTime
    console.log('=== Monitoring Metrics ===')
    console.log(`Total Duration: ${totalDuration}ms`)
    Object.entries(stepTiming).forEach(([step, duration]) => {
      console.log(`${step}: ${duration}ms`)
      // Log in Checkly-friendly format for metrics
      console.log(`METRIC step_${step} ${duration}`)
    })
    // Log total duration as a metric
    console.log(`METRIC total_duration ${totalDuration}`)
  } catch (error) {
    // Enhanced error logging for monitoring
    console.error('=== Monitoring Alert ===')
    console.error(`Error occurred at ${new Date().toISOString()}`)
    console.error('Step timings before failure:', stepTiming)
    console.error('Error details:', error)

    // Checkly will automatically capture failure screenshots
    throw error
  } finally {
    // Ensure resources are cleaned up even on error
    try {
      if (previewPage && !previewPage.isClosed()) {
        await previewPage.close()
      }
      if (page && !page.isClosed()) {
        await page.close()
      }
      if (context) {
        await context.close()
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError)
    }
  }
})
