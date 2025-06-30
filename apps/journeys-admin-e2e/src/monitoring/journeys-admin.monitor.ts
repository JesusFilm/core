import { expect, test } from '@playwright/test'

/*  
NS Admin: Monitoring
https://www.checklyhq.com/docs/cli/
*/

// Set 3 minutes timeout for this monitoring test
test.setTimeout(180000) // 3 minutes

/**
 * @check
 * @name NS Admin Monitoring
 * @retries 8 // Will retry the test 8 times
 * @retryInterval 10 // Will wait 10 seconds between retries
 * @maxRetryTime 600 // Will stop retrying after 10 minutes
 */
test('NS Admin Monitoring: Check user can login and create a journey via template', async ({
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
  let previewPage: any = null

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

    // Step 4: Template selection
    const templateStart = Date.now()
    await expect(page.getByTestId('NavigationListItemTemplates')).toBeVisible({
      timeout
    })
    await page.getByTestId('NavigationListItemTemplates').click({ timeout })
    await expect(
      page
        .getByTestId('love-template-gallery-carousel')
        .getByTestId('journey-0605d097-9da9-4da3-b23b-eec66553ec1e')
        .getByTestId('templateGalleryCard')
    ).toBeVisible({ timeout })
    await page
      .getByTestId('love-template-gallery-carousel')
      .getByTestId('journey-0605d097-9da9-4da3-b23b-eec66553ec1e')
      .getByTestId('templateGalleryCard')
      .click({ timeout })
    stepTiming['template_selection'] = Date.now() - templateStart

    // Step 5: Template usage and team selection
    const teamStart = Date.now()
    await page
      .getByTestId('JourneysAdminTemplateViewHeader')
      .getByRole('button', { name: 'Use This Template' })
      .click({ timeout })
    await page
      .getByRole('combobox', { name: 'Select Team ​' })
      .click({ timeout })
    await page.getByLabel('Playwright').click({ timeout })
    await page.getByRole('button', { name: 'Add' }).click({ timeout })
    stepTiming['team_selection'] = Date.now() - teamStart

    // Step 6: Journey editing
    const editStart = Date.now()

    // Wait for the iframe to be present with explicit timeout
    await page.waitForSelector('[data-testid="CanvasContainer"] iframe', {
      timeout
    })

    // Use frameLocator to handle the iframe
    const frame = page
      .frameLocator('[data-testid="CanvasContainer"] iframe')
      .first()

    // Wait for and verify the button exists
    await expect(
      frame.getByRole('button', { name: 'Watch the story' })
    ).toBeVisible({ timeout })

    // Perform the interactions
    await frame
      .getByRole('button', { name: 'Watch the story' })
      .click({ timeout })
    await frame.getByPlaceholder('Edit text...').click({ timeout })
    await frame
      .getByPlaceholder('Edit text...')
      .fill('Changed Button Text', { timeout })
    await page.getByTestId('EditorCanvas').click({ timeout })

    stepTiming['journey_editing'] = Date.now() - editStart

    // Step 7: Preview journey
    const previewStart = Date.now()
    await page.getByRole('link', { name: 'Preview' }).click({ timeout })

    previewPage = await page.waitForEvent('popup', { timeout })

    const overlayContainer = previewPage.getByTestId(
      'CardOverlayContentContainer'
    )

    // Try refreshing up to 5 times if button not visible
    let buttonVisible = false
    for (let i = 0; i < 5 && !buttonVisible; i++) {
      await previewPage.waitForLoadState('load', { timeout })
      buttonVisible = await overlayContainer
        .getByRole('button', { name: 'Changed Button Text' })
        .isVisible({ timeout })
      if (!buttonVisible) {
        // Wait 5 seconds as content publishing sometimes takes time
        await previewPage.waitForTimeout(5000)
        await previewPage.reload({ timeout })
      }
    }
    await expect(
      overlayContainer.getByRole('heading', { name: 'Are you happy?' })
    ).toBeVisible({ timeout })

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
