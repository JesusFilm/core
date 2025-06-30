import { expect, test } from '@playwright/test'

/*  
NS Admin Login: Monitoring
https://www.checklyhq.com/docs/cli/
This monitor specifically tests admin login functionality for quick health checks
*/

// Set 2 minutes timeout for this focused login test
test.setTimeout(120000) // 2 minutes

/**
 * @check
 * @name NS Admin Login Monitoring
 * @retries 5 // Will retry the test 5 times
 * @retryInterval 30 // Will wait 30 seconds between retries
 * @maxRetryTime 300 // Will stop retrying after 5 minutes
 */
test('NS Admin Login Monitoring: Verify admin can successfully login', async ({
  browser
}) => {
  if (!process.env.PLAYWRIGHT_EMAIL || !process.env.PLAYWRIGHT_PASSWORD) {
    throw new Error(
      'Email & password environment variables are not set in checkly.'
    )
  }

  const email = process.env.PLAYWRIGHT_EMAIL
  const password = process.env.PLAYWRIGHT_PASSWORD
  const timeout = 45000
  const startTime = Date.now()
  const stepTiming: { [key: string]: number } = {}

  // Declare variables that need cleanup
  let context: any = null
  let page: any = null

  try {
    context = await browser.newContext()
    page = await context.newPage()

    // Step 1: Navigate to admin login page
    const navigationStart = Date.now()
    await page.goto('https://admin.nextstep.is/', { timeout })
    
    // Verify we're on the login page
    await expect(
      page.getByPlaceholder('Enter your email address here')
    ).toBeVisible({ timeout })
    
    stepTiming['navigation'] = Date.now() - navigationStart

    // Step 2: Fill email and continue
    const emailStart = Date.now()
    await page
      .getByPlaceholder('Enter your email address here')
      .click({ timeout })
    await page
      .getByPlaceholder('Enter your email address here')
      .fill(email, { timeout })
    
    // Verify email was filled correctly
    await expect(page.locator('input[type="email"]')).toHaveValue(email)
    
    await page
      .getByRole('button', { name: 'Continue with email' })
      .click({ timeout })
    
    stepTiming['email_step'] = Date.now() - emailStart

    // Step 3: Fill password and sign in
    const passwordStart = Date.now()
    
    // Wait for password field to be visible
    await expect(page.getByPlaceholder('Enter Password')).toBeVisible({ timeout })
    
    await page.getByPlaceholder('Enter Password').click({ timeout })
    await page.getByPlaceholder('Enter Password').fill(password, { timeout })
    
    // Submit login form
    await page.getByRole('button', { name: 'Sign In' }).click({ timeout })
    
    stepTiming['password_step'] = Date.now() - passwordStart

    // Step 4: Verify successful login by checking for dashboard elements
    const verificationStart = Date.now()
    
    // Wait for dashboard to load - check for main navigation elements
    await expect(page.getByTestId('NavigationListItemDiscover')).toBeVisible({
      timeout
    })
    
    // Additional verification - check for user-specific elements
    await expect(page.getByTestId('NavigationListItemTemplates')).toBeVisible({
      timeout
    })
    
    // Verify we can see the main admin interface
    await expect(
      page.locator('div[data-testid="JourneysAdminContainedIconButton"]')
    ).toBeVisible({ timeout })
    
    stepTiming['verification'] = Date.now() - verificationStart

    // Log monitoring metrics
    const totalDuration = Date.now() - startTime
    console.log('=== Admin Login Monitoring Metrics ===')
    console.log(`Total Login Duration: ${totalDuration}ms`)
    Object.entries(stepTiming).forEach(([step, duration]) => {
      console.log(`${step}: ${duration}ms`)
      // Log in Checkly-friendly format for metrics
      console.log(`METRIC login_${step} ${duration}`)
    })
    // Log total duration as a metric
    console.log(`METRIC login_total_duration ${totalDuration}`)
    
    // Additional health check - verify critical navigation elements
    const navigationElements = [
      'NavigationListItemDiscover',
      'NavigationListItemTemplates',
      'NavigationListItemTrash'
    ]
    
    for (const element of navigationElements) {
      const elementVisible = await page.getByTestId(element).isVisible()
      console.log(`METRIC navigation_${element.toLowerCase()}_visible ${elementVisible ? 1 : 0}`)
    }
    
    console.log('=== Admin Login Successful ===')
    
  } catch (error) {
    // Enhanced error logging for monitoring
    console.error('=== Admin Login Monitoring Alert ===')
    console.error(`Login failure occurred at ${new Date().toISOString()}`)
    console.error('Step timings before failure:', stepTiming)
    console.error('Error details:', error)
    
    // Take screenshot on failure for debugging
    if (page && !page.isClosed()) {
      try {
        await page.screenshot({ 
          path: 'admin-login-failure.png',
          fullPage: true 
        })
        console.log('Failure screenshot captured: admin-login-failure.png')
      } catch (screenshotError) {
        console.error('Failed to capture screenshot:', screenshotError)
      }
    }
    
    // Log failure metric
    console.log('METRIC login_success 0')
    
    throw error
  } finally {
    // Log success metric if we got here without error
    console.log('METRIC login_success 1')
    
    // Ensure resources are cleaned up even on error
    try {
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