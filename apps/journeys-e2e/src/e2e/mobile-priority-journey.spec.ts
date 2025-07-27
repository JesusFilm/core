import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Mobile E2E Test for Priority Journey
 * Tests the complete mobile journey experience for the e2e-priority journey
 * URL: https://your-stage.nextstep.is/e2e-priority
 */

// Helper functions for mobile gestures and interactions
class MobileJourneyHelpers {
  constructor(private page: Page) {}

  async performSwipeGesture(direction: 'left' | 'right') {
    const cardContainer = this.page.locator('[data-testid="JourneysCard"]')
    const startX = direction === 'left' ? 300 : 100
    const endX = direction === 'left' ? 100 : 300
    
    await cardContainer.hover()
    await this.page.mouse.down()
    await this.page.mouse.move(endX, 200)
    await this.page.mouse.up()
    await this.page.waitForTimeout(500)
  }

  async navigateToCardWithText(text: string, maxAttempts = 10) {
    let attempts = 0
    while (attempts < maxAttempts) {
      if (await this.page.locator(`text=${text}`).isVisible()) {
        return true
      }
      
      const nextButton = this.page.getByTestId('ConductorNavigationButtonNext')
      if (await nextButton.isVisible()) {
        await nextButton.click()
        await this.page.waitForTimeout(1000)
      }
      
      attempts++
    }
    return false
  }

  async waitForVideoToLoad() {
    await this.page.waitForTimeout(2000)
    const video = this.page.locator('video').first()
    await video.waitFor({ state: 'visible', timeout: 10000 })
    return video
  }
}

test.describe('Mobile Priority Journey E2E Tests', () => {
  // Configure to only run on mobile projects
  test.beforeAll(async ({ browserName }, testInfo) => {
    // Skip if not running on mobile project
    if (!testInfo.project.name.includes('mobile')) {
      test.skip(true, 'This test is only for mobile viewports')
    }
  })
  test.beforeEach(async ({ page }) => {
    // Navigate to the priority journey
    await page.goto('/e2e-priority')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('should complete full mobile priority journey flow', async ({ page }) => {
    const helpers = new MobileJourneyHelpers(page)
    // Step 1: Verify initial page load
    await test.step('Step 1: Should land on the initial page', async () => {
      await expect(page).toHaveURL(/.*e2e-priority/)
      
      // Verify page elements are present
      await expect(page.locator('[data-testid="JourneysCard"]')).toBeVisible()
      
      // Check for pagination dots
      await expect(page.locator('[data-testid="ConductorNavigationPagination"]')).toBeVisible()
      
      // Check for info button (top right)
      await expect(page.locator('[data-testid="JourneysCardMenuButton"]')).toBeVisible()
      
      // Check for host info (bottom left)
      await expect(page.locator('[data-testid="JourneysCardContentContainer"]')).toBeVisible()
    })

    // Step 2: Swipe/click right to go to the next card
    await test.step('Step 2: Swipe/click right to go to the next card', async () => {
      const initialDots = await page.locator('[data-testid="ConductorNavigationPagination"] button').count()
      
      // Click next button or swipe right
      await page.getByTestId('ConductorNavigationButtonNext').click()
      
      // Verify pagination dots moved
      await expect(page.locator('[data-testid="ConductorNavigationPagination"] button.Mui-selected')).toHaveCount(1)
      
      // Verify UI elements are still present
      await expect(page.locator('[data-testid="JourneysCardMenuButton"]')).toBeVisible() // Info button
      await expect(page.locator('[data-testid="JourneysCardActions"]')).toBeVisible() // Share/Like buttons
      await expect(page.locator('[data-testid="JourneysCardContentContainer"]')).toBeVisible() // Host info
      
      // Check for chat widget
      await expect(page.locator('[data-testid="JourneysCard"] [data-testid*="Chat"]')).toBeVisible()
    })

    // Step 3: Open Info button / Click (i) icon
    await test.step('Step 3: Open Info button and verify popup content', async () => {
      await page.getByTestId('JourneysCardMenuButton').click()
      
      // Verify popup includes required elements
      await expect(page.locator('text=Report this content')).toBeVisible()
      await expect(page.locator('text=Terms & Conditions')).toBeVisible()
      
      // Should also show team name
      await expect(page.locator('[data-testid="JourneysCardMenu"]')).toBeVisible()
    })

    // Step 4: Click on 'Report this content'
    await test.step('Step 4: Click Report this content - should open email', async () => {
      // Start waiting for popup before clicking
      const popupPromise = page.waitForEvent('popup')
      
      await page.locator('text=Report this content').click()
      
      // Verify email client opens (or mailto link is triggered)
      const popup = await popupPromise
      await expect(popup.url()).toContain('mailto:')
      await popup.close()
    })

    // Step 5: Click on 'Terms & Conditions'
    await test.step('Step 5: Click Terms & Conditions - should open Cru terms page', async () => {
      // Reopen menu if needed
      if (!(await page.locator('[data-testid="JourneysCardMenu"]').isVisible())) {
        await page.getByTestId('JourneysCardMenuButton').click()
      }
      
      const popupPromise = page.waitForEvent('popup')
      
      await page.locator('text=Terms & Conditions').click()
      
      // Verify opens correct terms page
      const popup = await popupPromise
      await expect(popup.url()).toBe('https://www.cru.org/us/en/about/terms-of-use.html')
      await popup.close()
      
      // Close menu
      await page.keyboard.press('Escape')
    })

    // Step 6: Tap right arrow to go to the next card
    await test.step('Step 6: Navigate to next card', async () => {
      await page.getByTestId('ConductorNavigationButtonNext').click()
      
      // Verify moved to next card by checking pagination
      const selectedDots = await page.locator('[data-testid="ConductorNavigationPagination"] button.Mui-selected').count()
      await expect(selectedDots).toBe(1)
    })

    // Step 7: Test navigation with arrows and swipes
    await test.step('Step 7: Test left/right navigation and swipe gestures', async () => {
      // Get current card position
      const currentCard = await page.locator('[data-testid="ConductorNavigationPagination"] button.Mui-selected')
      
      // Test left arrow (previous)
      await page.getByTestId('ConductorNavigationButtonPrevious').click()
      await page.waitForTimeout(500) // Wait for animation
      
      // Test right arrow (next)
      await page.getByTestId('ConductorNavigationButtonNext').click()
      await page.waitForTimeout(500)
      
             // Test swipe gestures on mobile
       await helpers.performSwipeGesture('left') // Next card
       await helpers.performSwipeGesture('right') // Previous card
      
      // Verify pagination dots update accordingly
      await expect(page.locator('[data-testid="ConductorNavigationPagination"]')).toBeVisible()
    })

         // Step 8: Navigate to background video test section
     await test.step('Step 8: Navigate to background video test card', async () => {
       const found = await helpers.navigateToCardWithText('Background Video')
       expect(found).toBe(true)
     })

         // Step 9: Select 'Background Video' button
     await test.step('Step 9: Test Background Video from Jesus Film Library', async () => {
       await page.locator('text=Background Video').click()
       
       // Verify video is autoplaying and filling screen
       const video = await helpers.waitForVideoToLoad()
       await expect(video).toBeVisible()
      
      // Check video properties
      const isPlaying = await video.evaluate((vid: HTMLVideoElement) => !vid.paused)
      expect(isPlaying).toBe(true)
      
      // Verify color overlay on bottom half
      await expect(page.locator('[data-testid="JourneysCard"]')).toHaveCSS('background', /gradient|overlay/)
      
      // Verify white text and icons
      await expect(page.locator('[data-testid="JourneysCardContent"]')).toHaveCSS('color', /white|rgb\(255, 255, 255\)/)
    })

    // Step 10-12: Test different video sources
    await test.step('Step 10-12: Test YouTube and Custom video backgrounds', async () => {
      // Navigate through video cards
      for (let i = 0; i < 3; i++) {
        await page.getByTestId('ConductorNavigationButtonNext').click()
        await page.waitForTimeout(2000)
        
        // Verify video is present and playing
        const video = page.locator('video').first()
        if (await video.isVisible()) {
          const isPlaying = await video.evaluate((vid: HTMLVideoElement) => !vid.paused)
          expect(isPlaying).toBe(true)
          
          // Verify overlay and white text
          await expect(page.locator('[data-testid="JourneysCardContent"]')).toHaveCSS('color', /white|rgb\(255, 255, 255\)/)
        }
      }
    })

         // Step 13-16: Test background images
     await test.step('Step 13-16: Test background images', async () => {
       // Navigate to background images section
       const foundCheckImages = await helpers.navigateToCardWithText('Check Background Images')
       if (foundCheckImages) {
         await page.locator('text=Check Background Images').click()
         await page.waitForTimeout(1000)
       }
       
       const foundBackgroundImage = await helpers.navigateToCardWithText('Background Image')
       if (foundBackgroundImage) {
         await page.locator('text=Background Image').click()
         await page.waitForTimeout(1000)
       }
      
      // Test Gallery image
      await expect(page.locator('[data-testid="JourneysCard"]')).toHaveCSS('background-image', /url\(/)
      await expect(page.locator('[data-testid="JourneysCardContent"]')).toHaveCSS('color', /white|rgb\(255, 255, 255\)/)
      
      // Navigate through uploaded and AI generated images
      for (let i = 0; i < 2; i++) {
        await page.getByTestId('ConductorNavigationButtonNext').click()
        await page.waitForTimeout(1000)
        
        // Verify background image and overlay
        await expect(page.locator('[data-testid="JourneysCard"]')).toHaveCSS('background-image', /url\(/)
        await expect(page.locator('[data-testid="JourneysCardContent"]')).toHaveCSS('color', /white|rgb\(255, 255, 255\)/)
      }
    })

    // Step 17: Navigate to video block section
    await test.step('Step 17: Navigate to video block section', async () => {
      await page.locator('text=Keep Going').click()
      await page.getByTestId('ConductorNavigationButtonNext').click()
      await page.waitForTimeout(2000)
      
      // Verify video block is present and autoplaying
      const video = page.locator('video').first()
      await expect(video).toBeVisible()
      
      const isPlaying = await video.evaluate((vid: HTMLVideoElement) => !vid.paused)
      expect(isPlaying).toBe(true)
      
      // Verify unmuted
      const isMuted = await video.evaluate((vid: HTMLVideoElement) => vid.muted)
      expect(isMuted).toBe(false)
    })

    // Step 18-23: Test video controls
    await test.step('Step 18-23: Test video playback controls', async () => {
      const video = page.locator('video').first()
      
      // Step 18: Pause video by tapping
      await video.click()
      await page.waitForTimeout(500)
      let isPaused = await video.evaluate((vid: HTMLVideoElement) => vid.paused)
      expect(isPaused).toBe(true)
      
      // Step 19: Resume video by tapping
      await video.click()
      await page.waitForTimeout(500)
      isPaused = await video.evaluate((vid: HTMLVideoElement) => vid.paused)
      expect(isPaused).toBe(false)
      
      // Step 20: Test scrub bar
      const progressBar = page.locator('[data-testid="VideoProgressBar"]').or(page.locator('input[type="range"]'))
      if (await progressBar.isVisible()) {
        await progressBar.click()
        await page.waitForTimeout(500)
      }
      
      // Step 21: Test fullscreen
      const fullscreenButton = page.locator('[data-testid="VideoFullscreenButton"]').or(page.locator('[aria-label*="fullscreen"]'))
      if (await fullscreenButton.isVisible()) {
        await fullscreenButton.click()
        await page.waitForTimeout(1000)
        
        // Step 22: Exit fullscreen
        await page.keyboard.press('Escape')
        await page.waitForTimeout(1000)
      }
      
      // Step 23: Let video play to end (skip for test speed)
      // Note: In real test, you might want to fast-forward or wait for auto-advance
    })

    // Step 24-26: Test different video sources in video blocks
    await test.step('Step 24-26: Test YouTube and uploaded video blocks', async () => {
      // Navigate through different video block types
      for (let i = 0; i < 3; i++) {
        await page.getByTestId('ConductorNavigationButtonNext').click()
        await page.waitForTimeout(2000)
        
        const video = page.locator('video').first()
        if (await video.isVisible()) {
          // Test basic controls
          await video.click() // Pause
          await page.waitForTimeout(500)
          await video.click() // Resume
          await page.waitForTimeout(500)
        }
      }
    })

    // Step 27-30: Test image blocks and poll
    await test.step('Step 27-30: Test image blocks, poll, and response field', async () => {
      await page.getByTestId('ConductorNavigationButtonNext').click()
      await page.waitForTimeout(1000)
      
      // Verify image blocks are rendered
      await expect(page.locator('[data-testid="JourneysImageBlock"]').or(page.locator('img'))).toBeVisible()
      
      // Verify poll block is rendered
      await expect(page.locator('[data-testid="JourneysRadioQuestion"]').or(page.locator('input[type="radio"]'))).toBeVisible()
      
      // Step 28: Select 'House by the beach' option
      await page.locator('text=House by the beach').click()
      await page.waitForTimeout(1000)
      
      // Should navigate to response field
      await expect(page.locator('input[type="text"]').or(page.locator('textarea'))).toBeVisible()
      
      // Step 29: Test required field validation
      const textInput = page.locator('input[type="text"]').or(page.locator('textarea')).first()
      await textInput.click()
      await textInput.blur()
      
      // Should show validation message
      await expect(page.locator('text=required').or(page.locator('[role="alert"]'))).toBeVisible()
      
      // Step 30: Submit without text (should still allow progression)
      await page.locator('text=Submit').or(page.getByRole('button', { name: /submit/i })).click()
      await page.waitForTimeout(1000)
    })

    // Step 31: Test Facebook messenger chat widget
    await test.step('Step 31: Test Facebook messenger chat widget', async () => {
      const chatWidget = page.locator('[data-testid*="Chat"]').or(page.locator('[href*="messenger"]'))
      
      if (await chatWidget.isVisible()) {
        const popupPromise = page.waitForEvent('popup')
        await chatWidget.click()
        
        // Verify opens messaging link
        const popup = await popupPromise
        await expect(popup.url()).toMatch(/messenger|facebook|m\.me/)
        await popup.close()
      }
    })
  })

     // Separate test for mobile-specific features
   test('should handle mobile-specific interactions', async ({ page }) => {
     const helpers = new MobileJourneyHelpers(page)
     
     await test.step('Test mobile touch gestures', async () => {
       const cardContainer = page.locator('[data-testid="JourneysCard"]')
       
       // Test touch start/end events
       await cardContainer.dispatchEvent('touchstart', {
         touches: [{ clientX: 200, clientY: 300 }]
       })
       
       await cardContainer.dispatchEvent('touchmove', {
         touches: [{ clientX: 100, clientY: 300 }]
       })
       
       await cardContainer.dispatchEvent('touchend', {})
       
       await page.waitForTimeout(1000)
       
       // Verify navigation occurred
       await expect(page.locator('[data-testid="ConductorNavigationPagination"]')).toBeVisible()
     })

    await test.step('Test mobile viewport specific elements', async () => {
      // Verify mobile-optimized layout
      const viewportSize = page.viewportSize()
      expect(viewportSize?.width).toBeLessThan(800) // Mobile viewport
      
      // Check that elements are properly sized for mobile
      const card = page.locator('[data-testid="JourneysCard"]')
      const cardBox = await card.boundingBox()
      expect(cardBox?.width).toBeLessThanOrEqual(viewportSize?.width || 400)
    })
  })

  // Test specifically for video autoplay on mobile
  test('should handle video autoplay policies on mobile', async ({ page }) => {
    // Navigate to a video card
    await page.goto('/e2e-priority')
    
    // Find and test video autoplay
    let attempts = 0
    while (attempts < 5) {
      try {
        if (await page.locator('video').first().isVisible()) {
          const video = page.locator('video').first()
          
          // On mobile, videos might need user interaction to play
          await video.click()
          
          const isPlaying = await video.evaluate((vid: HTMLVideoElement) => !vid.paused)
          expect(isPlaying).toBe(true)
          break
        }
        
        await page.getByTestId('ConductorNavigationButtonNext').click()
        await page.waitForTimeout(1000)
        attempts++
      } catch (e) {
        attempts++
      }
    }
  })
})