import { expect, test } from '@playwright/test'
import {
  navigateToCropper,
  selectVideo,
  waitForVideoCatalog,
  startPreprocessing,
  waitForPreprocessingComplete,
  playVideo,
  pauseVideo,
  scrubTimeline,
  getCropBoxPosition,
  getYellowBoxPosition
} from '../support/cropper-helpers'

test.describe('Preprocessing Workflow Integration', () => {
  test.setTimeout(120000) // 2 minutes for preprocessing

  test('should complete full preprocessing workflow and move yellow box', async ({ page }) => {
    // Navigate to cropper
    await navigateToCropper(page)
    await waitForVideoCatalog(page)

    // Select a video
    await selectVideo(page)

    // Verify initial state - yellow box should be at default position (center)
    const initialYellowBox = await getYellowBoxPosition(page)
    expect(initialYellowBox).toBeDefined()
    expect(initialYellowBox.width).toBeGreaterThan(0)
    expect(initialYellowBox.height).toBeGreaterThan(0)

    // Start preprocessing
    await startPreprocessing(page, 'standard')

    // Wait for preprocessing to complete
    await waitForPreprocessingComplete(page)

    // Verify preprocessing completion indicators
    await expect(page.getByText('Preprocessed')).toBeVisible()
    await expect(page.getByText('✅ Preprocessing completed successfully')).toBeVisible()

    // Start playing the video
    await playVideo(page)

    // Wait a moment for playback to start
    await page.waitForTimeout(1000)

    // Check that yellow box moves from initial position during playback
    const midPlaybackYellowBox = await getYellowBoxPosition(page)
    expect(midPlaybackYellowBox).toBeDefined()

    // The yellow box should have moved from its initial position
    // (This verifies that preprocessed data is being applied)
    const positionChanged = initialYellowBox.left !== midPlaybackYellowBox.left ||
                           initialYellowBox.top !== midPlaybackYellowBox.top
    expect(positionChanged).toBe(true)

    // Pause and scrub to different time
    await pauseVideo(page)
    await scrubTimeline(page, 50) // 50% through video

    // Wait for position update
    await page.waitForTimeout(500)

    // Yellow box should be at a different position
    const scrubbedYellowBox = await getYellowBoxPosition(page)
    expect(scrubbedYellowBox).toBeDefined()

    // Position should be different from initial
    const scrubbedPositionChanged = initialYellowBox.left !== scrubbedYellowBox.left ||
                                   initialYellowBox.top !== scrubbedYellowBox.top
    expect(scrubbedPositionChanged).toBe(true)

    // Verify smooth transitions by checking multiple positions
    const positions: Array<{left: number, top: number}> = []

    // Play and capture positions at different times
    await playVideo(page)
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(1000)
      const pos = await getYellowBoxPosition(page)
      positions.push(pos)
    }
    await pauseVideo(page)

    // Verify that positions are changing (indicating smooth movement)
    const uniquePositions = new Set(positions.map(p => `${p.left},${p.top}`))
    expect(uniquePositions.size).toBeGreaterThan(1)
  })

  test('should handle preprocessing with different quality settings', async ({ page }) => {
    await navigateToCropper(page)
    await waitForVideoCatalog(page)
    await selectVideo(page)

    // Test fast quality
    await startPreprocessing(page, 'fast')
    await waitForPreprocessingComplete(page)
    await expect(page.getByText('Preprocessed')).toBeVisible()

    // Verify yellow box movement with fast quality
    await playVideo(page)
    await page.waitForTimeout(2000)
    const fastQualityPosition = await getYellowBoxPosition(page)
    await pauseVideo(page)

    // Reset and test standard quality
    await page.reload()
    await navigateToCropper(page)
    await waitForVideoCatalog(page)
    await selectVideo(page)

    await startPreprocessing(page, 'standard')
    await waitForPreprocessingComplete(page)

    await playVideo(page)
    await page.waitForTimeout(2000)
    const standardQualityPosition = await getYellowBoxPosition(page)
    await pauseVideo(page)

    // Both should work (exact positions may differ due to quality settings)
    expect(fastQualityPosition).toBeDefined()
    expect(standardQualityPosition).toBeDefined()
  })

  test('should maintain yellow box position accuracy during scene changes', async ({ page }) => {
    await navigateToCropper(page)
    await waitForVideoCatalog(page)
    await selectVideo(page)

    await startPreprocessing(page, 'standard')
    await waitForPreprocessingComplete(page)

    // Play through the video and monitor position changes
    await playVideo(page)

    const positionHistory: Array<{time: number, position: {left: number, top: number}}> = []

    // Monitor position every 2 seconds for 20 seconds
    for (let i = 0; i < 10; i++) {
      const currentTime = await page.locator('.vjs-current-time-display').textContent()
      const time = currentTime ? parseFloat(currentTime.replace(':', '.')) : i * 2

      const position = await getYellowBoxPosition(page)
      positionHistory.push({ time, position })

      await page.waitForTimeout(2000)
    }

    await pauseVideo(page)

    // Verify we captured multiple positions
    expect(positionHistory.length).toBeGreaterThan(5)

    // Verify positions are different (indicating movement)
    const uniquePositions = new Set(
      positionHistory.map(p => `${Math.round(p.position.left)},${Math.round(p.position.top)}`)
    )
    expect(uniquePositions.size).toBeGreaterThan(1)

    // Verify no sudden jumps (positions should be relatively smooth)
    for (let i = 1; i < positionHistory.length - 1; i++) {
      const prev = positionHistory[i - 1].position
      const current = positionHistory[i].position
      const next = positionHistory[i + 1].position

      // Check that movement is gradual (not jumping erratically)
      const prevToCurrent = Math.abs(prev.left - current.left) + Math.abs(prev.top - current.top)
      const currentToNext = Math.abs(current.left - next.left) + Math.abs(current.top - next.top)

      // Allow for some variation but not extreme jumps
      expect(prevToCurrent).toBeLessThan(200) // Reasonable movement threshold
      expect(currentToNext).toBeLessThan(200)
    }
  })

  test('should handle preprocessing errors gracefully', async ({ page }) => {
    await navigateToCropper(page)
    await waitForVideoCatalog(page)
    await selectVideo(page)

    // Try to start preprocessing (may fail in test environment)
    try {
      await startPreprocessing(page, 'standard')

      // If it completes, verify it works
      const preprocessingComplete = await page.getByText('Preprocessed').isVisible().catch(() => false)
      if (preprocessingComplete) {
        await playVideo(page)
        await page.waitForTimeout(2000)
        const yellowBox = await getYellowBoxPosition(page)
        expect(yellowBox).toBeDefined()
        await pauseVideo(page)
      }
    } catch (error) {
      // If preprocessing fails, the app should handle it gracefully
      console.log('Preprocessing failed as expected in test environment')

      // Should still be able to play video normally
      await playVideo(page)
      await page.waitForTimeout(1000)
      await pauseVideo(page)

      // Yellow box should still exist even if preprocessing failed
      const yellowBox = await getYellowBoxPosition(page)
      expect(yellowBox).toBeDefined()
    }
  })

  test('should preserve yellow box position when pausing and resuming', async ({ page }) => {
    await navigateToCropper(page)
    await waitForVideoCatalog(page)
    await selectVideo(page)

    await startPreprocessing(page, 'standard')
    await waitForPreprocessingComplete(page)

    await playVideo(page)
    await page.waitForTimeout(3000)

    const positionBeforePause = await getYellowBoxPosition(page)

    await pauseVideo(page)
    await page.waitForTimeout(500)

    const positionAfterPause = await getYellowBoxPosition(page)

    // Position should remain stable when paused
    expect(Math.abs(positionBeforePause.left - positionAfterPause.left)).toBeLessThan(5)
    expect(Math.abs(positionBeforePause.top - positionAfterPause.top)).toBeLessThan(5)

    // Resume and verify continued movement
    await playVideo(page)
    await page.waitForTimeout(2000)

    const positionAfterResume = await getYellowBoxPosition(page)

    // Position should have changed after resuming
    const hasMoved = Math.abs(positionAfterPause.left - positionAfterResume.left) > 10 ||
                    Math.abs(positionAfterPause.top - positionAfterResume.top) > 10
    expect(hasMoved).toBe(true)
  })

  test('should handle video scrubbing with preprocessed data', async ({ page }) => {
    await navigateToCropper(page)
    await waitForVideoCatalog(page)
    await selectVideo(page)

    await startPreprocessing(page, 'standard')
    await waitForPreprocessingComplete(page)

    // Test scrubbing to different positions
    const testPositions = [25, 50, 75]

    for (const position of testPositions) {
      await scrubTimeline(page, position)
      await page.waitForTimeout(1000) // Wait for position update

      const yellowBox = await getYellowBoxPosition(page)
      expect(yellowBox).toBeDefined()
      expect(yellowBox.width).toBeGreaterThan(0)
      expect(yellowBox.height).toBeGreaterThan(0)
    }

    // Verify that scrubbing to the same position multiple times gives consistent results
    await scrubTimeline(page, 50)
    await page.waitForTimeout(500)
    const pos1 = await getYellowBoxPosition(page)

    await scrubTimeline(page, 50)
    await page.waitForTimeout(500)
    const pos2 = await getYellowBoxPosition(page)

    // Should be very close (allowing for minor timing differences)
    expect(Math.abs(pos1.left - pos2.left)).toBeLessThan(2)
    expect(Math.abs(pos1.top - pos2.top)).toBeLessThan(2)
  })
})
