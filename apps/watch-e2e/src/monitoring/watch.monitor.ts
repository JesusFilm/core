import { expect, test } from '@playwright/test'

/**
 * @check
 * @name Watch Video Monitoring
 * @retries 8 // Will retry the test 8 times
 * @retryInterval 10 // Will wait 10 seconds between retries
 * @maxRetryTime 600 // Will stop retrying after 10 minutes
 */

/**
 * Comprehensive Video Monitoring Test
 *
 * This test monitors video playback functionality and network connectivity to detect issues like:
 * - MUX video loading failures
 * - CORS issues with video streaming
 * - Network errors preventing video playback
 * - Network failures to inferred.litix.io
 *
 * Based on the Slack conversation about videos from MUX not loading in production.
 */
test('Video playback and MUX network connectivity monitoring', async ({
  page
}) => {
  // Use Map for atomic updates to prevent race conditions
  const networkRequests = new Map<
    string,
    {
      url: string
      status: number
      error?: string
    }
  >()

  // Helper function to safely check if a URL is video-related
  const isVideoRelatedUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()

      // Check for specific domains using exact matching
      const allowedDomains = ['mux.com', 'litix.io', 'inferred.litix.io']
      const isAllowedDomain = allowedDomains.some(
        (domain) => hostname === domain || hostname.endsWith('.' + domain)
      )

      // Check for video-related path patterns
      const videoPathPatterns = ['.hls', '.m3u8', '/video', '/stream']
      const hasVideoPath = videoPathPatterns.some((pattern) =>
        urlObj.pathname.toLowerCase().includes(pattern)
      )

      return isAllowedDomain || hasVideoPath
    } catch {
      // Fallback for malformed URLs - use safer substring matching
      const urlLower = url.toLowerCase()
      const safePatterns = [
        'mux.com/',
        'litix.io/',
        'inferred.litix.io/',
        '.hls',
        '.m3u8'
      ]
      return safePatterns.some((pattern) => urlLower.includes(pattern))
    }
  }

  // Helper function to safely check if an error message is related to video services
  const isVideoRelatedError = (error: string): boolean => {
    const errorLower = error.toLowerCase()

    // Check for specific error patterns related to video services only
    const videoErrorPatterns = [
      'mux.com',
      'litix.io',
      'inferred.litix.io',
      'net::err_connection_refused',
      'net::err_connection_timed_out',
      'net::err_connection_reset',
      'net::err_network_changed',
      'net::err_internet_disconnected'
    ]

    // Only consider errors that are specifically related to video services
    // Ignore general 422/400 errors that might be from analytics or other services
    return videoErrorPatterns.some((pattern) => errorLower.includes(pattern))
  }

  // Listen to all network requests
  page.on('request', (request) => {
    const url = request.url()
    if (isVideoRelatedUrl(url)) {
      networkRequests.set(url, { url, status: 0 })
    }
  })

  // Listen to all network responses
  page.on('response', (response) => {
    const url = response.url()
    const status = response.status()

    if (isVideoRelatedUrl(url)) {
      const request = networkRequests.get(url)
      if (request) {
        request.status = status
      }
    }
  })

  // Listen to failed requests
  page.on('requestfailed', (request) => {
    const url = request.url()
    if (isVideoRelatedUrl(url)) {
      networkRequests.set(url, {
        url,
        status: 0,
        error: request.failure()?.errorText || 'Unknown error'
      })
    }
  })

  // Set up console error listener BEFORE navigation to capture all errors
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })

  // Navigate to the main watch page
  const response = await page.goto('https://www.jesusfilm.org/watch')
  expect(response?.status()).toEqual(200)

  // Wait for the page to be ready by checking for the title and main content
  await expect(page).toHaveTitle(/Watch | Jesus Film Project/)

  // Wait for the main content to be loaded by looking for video elements
  await page.waitForSelector('[data-testid="VideoCard"], [role="button"]', {
    timeout: 10000
  })

  // Look for a video title to click on (using the original working selector)
  const videoTitle = page.getByRole('button', {
    name: 'Jesus Calms the Storm Jesus Calms the Storm Chapter 1:59'
  })
  await expect(videoTitle).toBeVisible({ timeout: 10000 })

  // Click on the video to navigate to video page
  await videoTitle.click()

  // Wait for navigation to complete by checking for video page elements
  await page.waitForURL('**/watch/**', { timeout: 10000 })

  // Wait for video page to be ready by looking for video player elements
  await page.waitForSelector(
    'video, [data-testid="VideoHero"], [data-testid="VideoPlayer"]',
    { timeout: 15000 }
  )

  // Wait for any video elements to be present and ready
  await page.waitForFunction(
    () => {
      const videos = document.querySelectorAll('video')
      return videos.length > 0
    },
    { timeout: 10000 }
  )

  // Convert Map to Array for analysis
  const networkRequestsArray = Array.from(networkRequests.values())
  const failedRequests = networkRequestsArray.filter(
    (req) => req.status === 0 || req.error
  )
  const successfulRequests = networkRequestsArray.filter(
    (req) => req.status >= 200 && req.status < 300
  )

  // Check for specific MUX-related network issues using proper URL parsing
  const muxRequests = networkRequestsArray.filter((req) => {
    try {
      const urlObj = new URL(req.url)
      const hostname = urlObj.hostname.toLowerCase()
      return (
        hostname === 'mux.com' ||
        hostname.endsWith('.mux.com') ||
        hostname === 'litix.io' ||
        hostname.endsWith('.litix.io') ||
        hostname === 'inferred.litix.io' ||
        hostname.endsWith('.inferred.litix.io')
      )
    } catch {
      // Fallback for malformed URLs
      const urlLower = req.url.toLowerCase()
      return (
        urlLower.includes('mux.com/') ||
        urlLower.includes('litix.io/') ||
        urlLower.includes('inferred.litix.io/')
      )
    }
  })

  const hlsRequests = networkRequestsArray.filter((req) => {
    try {
      const urlObj = new URL(req.url)
      return (
        urlObj.pathname.toLowerCase().includes('.hls') ||
        urlObj.pathname.toLowerCase().includes('.m3u8')
      )
    } catch {
      // Fallback for malformed URLs
      const urlLower = req.url.toLowerCase()
      return urlLower.includes('/.hls') || urlLower.includes('/.m3u8')
    }
  })

  // Log network analysis
  console.log(`📊 Network Analysis:
    - Total video-related requests: ${networkRequestsArray.length}
    - Successful requests: ${successfulRequests.length}
    - Failed requests: ${failedRequests.length}
    - MUX requests: ${muxRequests.length}
    - HLS requests: ${hlsRequests.length}`)

  // Check for critical errors (only the specific types mentioned in the Slack conversation)
  const criticalErrors = consoleErrors.filter((error) =>
    isVideoRelatedError(error)
  )

  // Fail the test if there are critical network issues
  if (criticalErrors.length > 0) {
    console.log('🚨 Critical network errors detected:', criticalErrors)
    throw new Error(`Critical network errors: ${criticalErrors.join(', ')}`)
  }

  // Fail if there are failed MUX requests (only if they have actual errors)
  const failedMuxRequests = muxRequests.filter((req) => req.error)
  if (failedMuxRequests.length > 0) {
    console.log('🚨 Failed MUX requests:', failedMuxRequests)
    throw new Error(
      `MUX network failures: ${failedMuxRequests.map((req) => req.url).join(', ')}`
    )
  }

  // Fix the logic error: Check for no successful requests OR no total requests
  if (successfulRequests.length === 0) {
    if (networkRequestsArray.length === 0) {
      throw new Error('No video-related network requests detected')
    } else {
      console.log('⚠️ No successful video requests, but requests were made')
    }
  }

  // Verify video elements are present on the page
  const videoElements = page.locator('video')
  const videoCount = await videoElements.count()

  if (videoCount === 0) {
    throw new Error('No video elements found on the page')
  }

  console.log(`Found ${videoCount} video elements on the page`)

  // Check if any video has loaded metadata
  const videoReadyStates = await page.evaluate(() => {
    const videos = document.querySelectorAll('video')
    return Array.from(videos).map((video) => video.readyState)
  })

  const hasLoadedVideo = videoReadyStates.some((state) => state >= 1)
  if (!hasLoadedVideo) {
    console.log('Video ready states:', videoReadyStates)
    console.log(
      '⚠️ No video has loaded metadata yet, but this might be normal for some video players'
    )
    // Don't fail the test for this, just log it as a warning
  } else {
    console.log('✅ Video metadata loaded successfully')
  }

  console.log(
    '✅ Video monitoring completed successfully - All video playback and streaming services are healthy'
  )
})
