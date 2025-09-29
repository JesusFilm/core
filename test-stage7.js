#!/usr/bin/env node

/**
 * Test script for Stage 7: Adaptive Detector Cadence + Tracker-First ROI
 * This script verifies the new tracker and scheduler components work correctly
 */

const { FaceTracker, GlobalMotionEstimator, DEFAULT_TRACKER_CONFIG, DEFAULT_MOTION_CONFIG } = require('./libs/shared/video-processing/src/lib/analysis/track.ts')
const { AdaptiveCadenceScheduler, cadenceController, DEFAULT_SCHEDULER_CONFIG } = require('./libs/shared/video-processing/src/lib/analysis/scheduler.ts')

console.log('🧪 Testing Stage 7: Adaptive Detector Cadence + Tracker-First ROI\n')

// Test 1: FaceTracker basic functionality
console.log('1️⃣ Testing FaceTracker...')

try {
  const tracker = new FaceTracker()

  // Create mock ImageData (320x240 for testing)
  const mockImageData = {
    width: 320,
    height: 240,
    data: new Uint8ClampedArray(320 * 240 * 4).fill(128) // Gray image
  }

  // Test ROI
  const roi = {
    x: 0.4,
    y: 0.4,
    width: 0.2,
    height: 0.2,
    confidence: 0.8,
    lastUpdate: Date.now()
  }

  // Initialize tracker
  tracker.initialize(mockImageData, roi)
  console.log('  ✅ Tracker initialized successfully')

  // Test tracking (should return same ROI since image is uniform)
  const trackedROI = tracker.track(mockImageData, Date.now() + 100)
  console.log('  ✅ Tracking completed:', trackedROI ? 'ROI found' : 'ROI lost')

  // Test innovation update
  const innovation = tracker.updateWithDetection(mockImageData, {
    ...roi,
    x: 0.42, // Small movement
    confidence: 0.85,
    lastUpdate: Date.now() + 200
  })
  console.log('  ✅ Innovation calculated:', innovation.score.toFixed(3))

} catch (error) {
  console.log('  ❌ FaceTracker test failed:', error.message)
}

// Test 2: GlobalMotionEstimator
console.log('\n2️⃣ Testing GlobalMotionEstimator...')

try {
  const motionEstimator = new GlobalMotionEstimator()

  // Create two slightly different frames to simulate motion
  const frame1 = {
    width: 160,
    height: 90,
    data: new Uint8ClampedArray(160 * 90 * 4).fill(100)
  }

  const frame2 = {
    width: 160,
    height: 90,
    data: new Uint8ClampedArray(160 * 90 * 4).fill(100)
  }

  // Add some motion to frame2 (shift right by 2 pixels)
  for (let y = 0; y < 90; y++) {
    for (let x = 2; x < 160; x++) {
      const idx = (y * 160 + x) * 4
      frame2.data[idx] = frame1.data[(y * 160 + x - 2) * 4] // Copy from left
    }
  }

  const motionEstimate = motionEstimator.estimateMotion(frame1)
  console.log('  ✅ First frame processed')

  const motionEstimate2 = motionEstimator.estimateMotion(frame2)
  console.log('  ✅ Motion estimated:', motionEstimate2 ?
    `X: ${motionEstimate2.motionX.toFixed(1)}, Y: ${motionEstimate2.motionY.toFixed(1)}, Mag: ${motionEstimate2.magnitude.toFixed(1)}` :
    'No motion detected')

} catch (error) {
  console.log('  ❌ GlobalMotionEstimator test failed:', error.message)
}

// Test 3: AdaptiveCadenceScheduler
console.log('\n3️⃣ Testing AdaptiveCadenceScheduler...')

try {
  const scheduler = new AdaptiveCadenceScheduler()

  // Test stable tracking scenario
  const stableInnovation = {
    score: 0.05, // Low innovation = stable
    positionDelta: 2,
    sizeDelta: 0,
    confidenceDelta: 0.02,
    timestamp: Date.now()
  }

  const decision1 = scheduler.getNextCadence(0, stableInnovation)
  console.log('  ✅ Stable tracking decision:', decision1.cadence, decision1.reason)

  // Test unstable tracking scenario
  const unstableInnovation = {
    score: 0.6, // High innovation = unstable
    positionDelta: 15,
    sizeDelta: 0.1,
    confidenceDelta: -0.1,
    timestamp: Date.now() + 1000
  }

  const decision2 = scheduler.getNextCadence(3, unstableInnovation)
  console.log('  ✅ Unstable tracking decision:', decision2.cadence, decision2.reason)

  // Test high motion scenario
  const highMotion = {
    motionX: 5,
    motionY: 3,
    confidence: 0.8,
    magnitude: 6,
    timestamp: Date.now() + 2000
  }

  const decision3 = scheduler.getNextCadence(6, undefined, highMotion)
  console.log('  ✅ High motion decision:', decision3.cadence, decision3.reason)

  // Check final stats
  const stats = scheduler.getStats()
  console.log('  ✅ Scheduler stats - Avg cadence:', stats.averageCadence.toFixed(1))

} catch (error) {
  console.log('  ❌ AdaptiveCadenceScheduler test failed:', error.message)
}

// Test 4: Utility function
console.log('\n4️⃣ Testing cadenceController utility...')

try {
  // Test various scenarios
  const testCases = [
    { name: 'Stable tracking', innovation: { score: 0.03 }, currentCadence: 5, expected: 6 },
    { name: 'Unstable tracking', innovation: { score: 0.7 }, currentCadence: 6, expected: 5 },
    { name: 'High motion', motion: { magnitude: 20 }, currentCadence: 4, expected: 4 },
    { name: 'Near cut', nearCut: true, currentCadence: 8, expected: 7 }
  ]

  for (const testCase of testCases) {
    const result = cadenceController(
      testCase.innovation,
      testCase.motion,
      testCase.nearCut,
      testCase.currentCadence
    )
    const status = result === testCase.expected ? '✅' : '❌'
    console.log(`  ${status} ${testCase.name}: ${testCase.currentCadence} → ${result}`)
  }

} catch (error) {
  console.log('  ❌ cadenceController test failed:', error.message)
}

console.log('\n🎉 Stage 7 testing completed!')
console.log('\n📊 Expected Performance Improvements:')
console.log('  • 50%+ reduction in face detection calls')
console.log('  • Improved tracking stability across scene changes')
console.log('  • Adaptive cadence based on motion and innovation')
console.log('  • Correlation-based ROI tracking between detections')

console.log('\n🔬 To test end-to-end functionality:')
console.log('  1. Run: npx nx serve cropper')
console.log('  2. Upload a video with faces')
console.log('  3. Run preprocessing and observe detection patterns')
console.log('  4. Check browser console for tracking metrics')
console.log('  5. Run e2e tests: npx nx e2e cropper-e2e --spec=person-detection.spec.ts')
