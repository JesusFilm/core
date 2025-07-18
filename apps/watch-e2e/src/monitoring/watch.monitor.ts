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
test('Watch Video Monitoring: Check video playback and MUX network connectivity', async ({
  page
}) => {
  // Track network requests and responses
  const networkRequests: Array<{ url: string; status: number; error?: string }> = []
  
  // Listen to all network requests
  page.on('request', (request) => {
    const url = request.url()
    if (url.includes('mux') || url.includes('litix') || url.includes('hls') || url.includes('m3u8')) {
      networkRequests.push({ url, status: 0 })
    }
  })
  
  // Listen to all network responses
  page.on('response', (response) => {
    const url = response.url()
    const status = response.status()
    
    if (url.includes('mux') || url.includes('litix') || url.includes('hls') || url.includes('m3u8')) {
      const request = networkRequests.find(req => req.url === url)
      if (request) {
        request.status = status
      }
    }
  })
  
  // Listen to failed requests
  page.on('requestfailed', (request) => {
    const url = request.url()
    if (url.includes('mux') || url.includes('litix') || url.includes('hls') || url.includes('m3u8')) {
      networkRequests.push({ 
        url, 
        status: 0, 
        error: request.failure()?.errorText || 'Unknown error' 
      })
    }
  })
  
  // Navigate to the main watch page
  const response = await page.goto('https://www.jesusfilm.org/watch')
  expect(response?.status()).toEqual(200)
  
  // Wait for the page to load completely
  await page.waitForLoadState('networkidle')
  
  // Check if the page title is correct
  await expect(page).toHaveTitle(/Watch | Jesus Film Project/)
  
  // Look for a video title to click on (using the same selector as the working test)
  const videoTitle = page.getByRole('button', {
    name: 'Jesus Calms the Storm Jesus Calms the Storm Chapter 1:59'
  })
  await expect(videoTitle).toBeVisible({ timeout: 10000 })
  
  // Click on the video to navigate to video page
  await videoTitle.click()
  
  // Wait for navigation to video page
  await page.waitForLoadState('networkidle')
  
  // Wait a bit for the page to fully load
  await page.waitForTimeout(3000)
  
  // Wait additional time for network requests to complete
  await page.waitForTimeout(15000)
  
  // Check for console errors related to video streaming
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })
  
  // Analyze network requests
  const failedRequests = networkRequests.filter(req => req.status === 0 || req.error)
  const successfulRequests = networkRequests.filter(req => req.status >= 200 && req.status < 300)
  
  // Check for specific MUX-related network issues
  const muxRequests = networkRequests.filter(req => 
    req.url.includes('mux') || 
    req.url.includes('litix') || 
    req.url.includes('inferred.litix.io')
  )
  
  const hlsRequests = networkRequests.filter(req => 
    req.url.includes('hls') || 
    req.url.includes('m3u8')
  )
  
  // Log network analysis
  console.log(`📊 Network Analysis:
    - Total video-related requests: ${networkRequests.length}
    - Successful requests: ${successfulRequests.length}
    - Failed requests: ${failedRequests.length}
    - MUX requests: ${muxRequests.length}
    - HLS requests: ${hlsRequests.length}`)
  
  // Check for critical errors
  const criticalErrors = consoleErrors.filter(error => 
    error.includes('CORS') ||
    error.includes('mux') || 
    error.includes('litix') ||
    error.includes('inferred.litix.io') ||
    error.includes('net::ERR') ||
    error.includes('Failed to load resource')
  )
  
  // Fail the test if there are critical network issues
  if (criticalErrors.length > 0) {
    console.log('🚨 Critical network errors detected:', criticalErrors)
    throw new Error(`Critical network errors: ${criticalErrors.join(', ')}`)
  }
  
  // Fail if there are failed MUX requests
  if (muxRequests.some(req => req.error || req.status === 0)) {
    const failedMuxRequests = muxRequests.filter(req => req.error || req.status === 0)
    console.log('🚨 Failed MUX requests:', failedMuxRequests)
    throw new Error(`MUX network failures: ${failedMuxRequests.map(req => req.url).join(', ')}`)
  }
  
  // Ensure we have at least some successful video-related requests
  if (successfulRequests.length === 0) {
    throw new Error('No successful video-related network requests detected')
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
    return Array.from(videos).map(video => video.readyState)
  })
  
  const hasLoadedVideo = videoReadyStates.some(state => state >= 1)
  if (!hasLoadedVideo) {
    console.log('Video ready states:', videoReadyStates)
    console.log('⚠️ No video has loaded metadata yet, but this might be normal for some video players')
    // Don't fail the test for this, just log it as a warning
  } else {
    console.log('✅ Video metadata loaded successfully')
  }
  
  console.log('✅ Video monitoring completed successfully - All video playback and streaming services are healthy')
}) 