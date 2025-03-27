import { expect, test } from '@playwright/test'

/*  
NS Admin: Monitoring
https://www.checklyhq.com/docs/cli/
*/

// Set a longer timeout for this monitoring test
test.setTimeout(100000)

/**
 * @check
 * @name NS Admin Monitoring
 * @retries 8 // Will retry the test 8 times
 * @retryInterval 10 // Will wait 10 seconds between retries
 * @maxRetryTime 600 // Will stop retrying after 10 minutes
 */
test('NS Admin Monitoring: Check user can login and create a journey via template', async ({
  page
}) => {
  if (!process.env.PLAYWRIGHT_EMAIL || !process.env.PLAYWRIGHT_PASSWORD) {
    throw new Error(
      'Email & password environment variables are not set in checkly.'
    )
  }

  const email = process.env.PLAYWRIGHT_EMAIL
  const password = process.env.PLAYWRIGHT_PASSWORD

  const defaultTimeout = 30000
  const navigationTimeout = 60000

  // Configure longer timeouts for navigation
  page.setDefaultTimeout(defaultTimeout)
  page.setDefaultNavigationTimeout(navigationTimeout)

  const startTime = Date.now()
  const stepTiming: { [key: string]: number } = {}

  try {
    // Step 1: Navigate to login page
    const loginStart = Date.now()
    await page.goto('https://admin.nextstep.is/', {
      timeout: navigationTimeout
    })
    stepTiming['navigation'] = Date.now() - loginStart

    // Step 2: Login
    const authStart = Date.now()
    await page.getByPlaceholder('Enter your email address here').click()
    await page.getByPlaceholder('Enter your email address here').fill(email)
    await page.getByRole('button', { name: 'Continue with email' }).click()
    await page.getByPlaceholder('Enter Password').click()
    await page.getByPlaceholder('Enter Password').fill(password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    stepTiming['authentication'] = Date.now() - authStart

    // Step 3: Wait for and verify dashboard load
    const dashboardStart = Date.now()
    await expect(page.getByTestId('NavigationListItemTemplates')).toBeVisible({
      timeout: defaultTimeout
    })
    // Take checkpoint screenshot after login
    await page.screenshot({ fullPage: true })
    stepTiming['dashboard_load'] = Date.now() - dashboardStart

    // Step 4: Template selection
    const templateStart = Date.now()
    await page.getByTestId('NavigationListItemTemplates').click()
    await expect(
      page
        .getByTestId('love-template-gallery-carousel')
        .getByTestId('journey-0605d097-9da9-4da3-b23b-eec66553ec1e')
        .getByTestId('templateGalleryCard')
    ).toBeVisible({ timeout: defaultTimeout })
    await page
      .getByTestId('love-template-gallery-carousel')
      .getByTestId('journey-0605d097-9da9-4da3-b23b-eec66553ec1e')
      .getByTestId('templateGalleryCard')
      .click()
    // Take checkpoint screenshot after template selection
    await page.screenshot({ fullPage: true })
    stepTiming['template_selection'] = Date.now() - templateStart

    // Step 5: Template usage and team selection
    const teamStart = Date.now()
    await page
      .getByTestId('JourneysAdminTemplateViewHeader')
      .getByRole('button', { name: 'Use This Template' })
      .click()
    await page.getByRole('combobox', { name: 'Select Team ​' }).click()
    await page.getByLabel('Playwright').click()
    await page.getByRole('button', { name: 'Add' }).click()
    stepTiming['team_selection'] = Date.now() - teamStart

    // Step 6: Journey editing
    const editStart = Date.now()

    // Wait for the iframe to be present with explicit timeout
    await page.waitForSelector('[data-testid="CanvasContainer"] iframe', {
      timeout: defaultTimeout
    })

    // Use frameLocator to handle the iframe
    const frame = page
      .frameLocator('[data-testid="CanvasContainer"] iframe')
      .first()

    // Wait for and verify the button exists
    await expect(
      frame.getByRole('button', { name: 'Watch the story' })
    ).toBeVisible({ timeout: defaultTimeout })

    // Perform the interactions
    await frame.getByRole('button', { name: 'Watch the story' }).click()
    await frame.getByPlaceholder('Edit text...').click()
    await frame.getByPlaceholder('Edit text...').fill('Changed Button Text')
    await page.getByTestId('EditorCanvas').click()

    // Take checkpoint screenshot after editing
    await page.screenshot({ fullPage: true })
    stepTiming['journey_editing'] = Date.now() - editStart

    // Step 7: Preview journey
    const previewStart = Date.now()
    await page.getByTestId('Fab').click()
    await page.getByRole('link', { name: 'Preview' }).click()

    const previewPage = await page.waitForEvent('popup', {
      timeout: defaultTimeout
    })

    const overlayContainer = previewPage.getByTestId(
      'CardOverlayContentContainer'
    )
    await expect(overlayContainer).toBeVisible({ timeout: defaultTimeout })

    await expect(
      overlayContainer.getByRole('heading', { name: 'Are you happy?' })
    ).toBeVisible({ timeout: defaultTimeout })
    await expect(
      overlayContainer.getByRole('button', { name: 'Changed Button Text' })
    ).toBeVisible({ timeout: defaultTimeout })
    // Take checkpoint screenshot of preview
    await previewPage.screenshot({ fullPage: true })
    stepTiming['preview_load'] = Date.now() - previewStart

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
  }
})
