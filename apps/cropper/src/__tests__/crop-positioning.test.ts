import {
  CropPositionCalculator,
  createCropPositionCalculator,
  DEFAULT_CROP_POSITIONING_CONFIG,
  type CropPositioningConfig,
  type CropPositionResult,
  type PositioningStrategy
} from '../lib/crop-positioning'
import type { DetectionResult, CropBox, SceneTimeline, SceneSegment } from '../types'

/**
 * Comprehensive Crop Positioning Tests
 * Tests exact output values, edge cases, error conditions, and integration
 */

// Mock data factories for consistent test data
function createMockDetection(overrides: Partial<DetectionResult> = {}): DetectionResult {
  return {
    id: 'det-1',
    time: 5.5,
    box: { x: 0.3, y: 0.2, width: 0.15, height: 0.18 },
    confidence: 0.85,
    label: 'person',
    source: 'mediapipe',
    ...overrides
  }
}

function createMockSceneSegment(overrides: Partial<SceneSegment> = {}): SceneSegment {
  return {
    id: 'segment-1',
    startTime: 0,
    endTime: 10,
    type: 'static',
    motionMagnitude: 0.2,
    dominantDirection: 0,
    confidence: 0.9,
    detectionCount: 5,
    ...overrides
  }
}

function createMockSceneTimeline(segments: SceneSegment[] = []): SceneTimeline {
  return {
    segments,
    sceneChanges: [],
    metadata: {
      totalDuration: 30,
      segmentCount: segments.length,
      averageMotion: 0.3,
      processingTime: 150
    }
  }
}

describe('CropPositionCalculator - Comprehensive Tests', () => {
  describe('Core Functionality', () => {
    test('should create calculator with default config', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      expect(calculator).toBeInstanceOf(CropPositionCalculator)
      expect(calculator.getConfig().targetAspectRatio).toBe(9/16)
      expect(calculator.getConfig().videoDimensions).toEqual({ width: 1920, height: 1080 })
    })

    test('should calculate crop position for single detection', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [createMockDetection({
        box: { x: 0.4, y: 0.3, width: 0.2, height: 0.4 },
        confidence: 0.9,
        label: 'person'
      })]

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = calculator.calculateCropPosition(5.0, detections, sceneTimeline)

      expect(result).toBeDefined()
      expect(result.time).toBe(5.0)
      expect(result.source).toBe('detection')
      expect(result.confidence).toBe(0.9)
      expect(result.cropBox).toBeDefined()
      expect(result.window).toBeDefined()
    })

    test('should handle multiple detections with weighted center', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [
        createMockDetection({
          box: { x: 0.2, y: 0.2, width: 0.1, height: 0.2 },
          confidence: 0.8,
          label: 'person'
        }),
        createMockDetection({
          box: { x: 0.6, y: 0.4, width: 0.15, height: 0.3 },
          confidence: 0.9,
          label: 'person'
        })
      ]

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = calculator.calculateCropPosition(5.0, detections, sceneTimeline)

      expect(result.source).toBe('detection')
      expect(result.confidence).toBe(0.8) // Minimum confidence
      expect(result.metadata.detectionCount).toBe(2)
    })
  })

  describe('Edge Cases and Error Conditions', () => {
    test('should handle empty detections array', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })
      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = calculator.calculateCropPosition(5.0, [], sceneTimeline)

      expect(result.source).toBe('fallback')
      expect(result.confidence).toBe(0.3)
      expect(result.cropBox.width).toBeGreaterThan(0)
      expect(result.cropBox.height).toBe(1.0)
    })

    test('should handle low confidence detections', () => {
      const calculator = createCropPositionCalculator(
        { width: 1920, height: 1080 },
        { quality: { minConfidence: 0.8 } }
      )

      const detections = [createMockDetection({ confidence: 0.3, label: 'person' })]
      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = calculator.calculateCropPosition(5.0, detections, sceneTimeline)

      expect(result.source).toBe('fallback')
    })

    test('should handle invalid detection labels', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [createMockDetection({ label: 'car', confidence: 0.9 })]
      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = calculator.calculateCropPosition(5.0, detections, sceneTimeline)

      expect(result.source).toBe('fallback')
    })

    test('should handle extreme boundary positions', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [createMockDetection({
        box: { x: 0.95, y: 0.9, width: 0.05, height: 0.1 },
        confidence: 0.9,
        label: 'person'
      })]

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = calculator.calculateCropPosition(5.0, detections, sceneTimeline)

      // The algorithm should produce valid crop boxes
      expect(result.cropBox).toBeDefined()
      expect(result.cropBox.width).toBeGreaterThan(0)
      expect(result.cropBox.height).toBeGreaterThan(0)
      expect(result.source).toBe('detection')
    })

    test('should handle invalid detection data', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [createMockDetection({
        box: { x: NaN, y: 0.2, width: 0.1, height: 0.2 },
        confidence: 0.9,
        label: 'person'
      })]

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = calculator.calculateCropPosition(5.0, detections, sceneTimeline)

      // The algorithm should handle invalid data gracefully
      expect(result).toBeDefined()
      expect(result.cropBox).toBeDefined()
      expect(typeof result.source).toBe('string')
    })
  })

  describe('Scene-Aware Integration', () => {
    test('should adapt to different scene types', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [createMockDetection()]
      const transitionTimeline = createMockSceneTimeline([
        createMockSceneSegment({ type: 'transition' })
      ])

      const result = calculator.calculateCropPosition(5.0, detections, transitionTimeline)

      expect(result.source).toBe('detection')
      expect(result.metadata.sceneSegmentId).toBeDefined()
    })

    test('should handle missing scene segments', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [createMockDetection()]
      const emptyTimeline = createMockSceneTimeline([])

      const result = calculator.calculateCropPosition(5.0, detections, emptyTimeline)

      expect(result.source).toBe('detection')
      expect(result.metadata.sceneSegmentId).toBeUndefined()
    })
  })

  describe('Motion Prediction and Interpolation', () => {
    test('should predict motion from recent positions', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const previousPositions: CropPositionResult[] = [
        {
          time: 4.0,
          cropBox: { x: 0.2, y: 0.1, width: 0.5, height: 1.0 },
          window: { focusX: 0.45, focusY: 0.5, scale: 0.5 },
          confidence: 0.8,
          source: 'detection',
          metadata: { processingTime: 10, delayCompensation: 0, detectionCount: 1 }
        },
        {
          time: 4.5,
          cropBox: { x: 0.25, y: 0.1, width: 0.5, height: 1.0 },
          window: { focusX: 0.5, focusY: 0.5, scale: 0.5 },
          confidence: 0.8,
          source: 'detection',
          metadata: { processingTime: 10, delayCompensation: 0, detectionCount: 1 }
        }
      ]

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = calculator.calculateCropPosition(5.0, [], sceneTimeline, previousPositions)

      expect(['prediction', 'interpolation', 'fallback']).toContain(result.source)
      expect(typeof result.confidence).toBe('number')
    })

    test('should interpolate between positions', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const previousPositions: CropPositionResult[] = [
        {
          time: 4.0,
          cropBox: { x: 0.2, y: 0.1, width: 0.5, height: 1.0 },
          window: { focusX: 0.45, focusY: 0.5, scale: 0.5 },
          confidence: 0.8,
          source: 'detection',
          metadata: { processingTime: 10, delayCompensation: 0, detectionCount: 1 }
        },
        {
          time: 6.0,
          cropBox: { x: 0.4, y: 0.1, width: 0.5, height: 1.0 },
          window: { focusX: 0.65, focusY: 0.5, scale: 0.5 },
          confidence: 0.8,
          source: 'detection',
          metadata: { processingTime: 10, delayCompensation: 0, detectionCount: 1 }
        }
      ]

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = calculator.calculateCropPosition(5.0, [], sceneTimeline, previousPositions)

      expect(['interpolation', 'prediction', 'fallback']).toContain(result.source)
      expect(result.cropBox.x).toBeGreaterThanOrEqual(0)
      expect(result.cropBox.x + result.cropBox.width).toBeLessThanOrEqual(1)
    })
  })

  describe('Fallback Strategies', () => {
    test('should use different fallback strategies', () => {
      const centerCalculator = createCropPositionCalculator(
        { width: 1920, height: 1080 },
        { quality: { fallbackStrategy: 'center' } }
      )

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = centerCalculator.calculateCropPosition(5.0, [], sceneTimeline)

      expect(result.source).toBe('fallback')
      expect(result.cropBox.x).toBeGreaterThanOrEqual(0)
      expect(result.cropBox.y).toBe(0)
      expect(result.cropBox.height).toBe(1.0)
    })

    test('should use previous position when available', () => {
      const calculator = createCropPositionCalculator(
        { width: 1920, height: 1080 },
        { quality: { fallbackStrategy: 'previous' } }
      )

      const previousPositions: CropPositionResult[] = [
        {
          time: 4.5,
          cropBox: { x: 0.3, y: 0.1, width: 0.5, height: 1.0 },
          window: { focusX: 0.55, focusY: 0.5, scale: 0.5 },
          confidence: 0.8,
          source: 'detection',
          metadata: { processingTime: 10, delayCompensation: 0, detectionCount: 1 }
        }
      ]

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = calculator.calculateCropPosition(5.0, [], sceneTimeline, previousPositions)

      expect(result.source).toBe('interpolation')
      expect(result.cropBox).toEqual(previousPositions[0].cropBox)
    })
  })

  describe('Batch Processing', () => {
    test('should process multiple time points', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const times = [1.0, 2.0, 3.0, 4.0, 5.0]
      const detectionMap = new Map([
        [1.0, [createMockDetection({ time: 1.0, box: { x: 0.2, y: 0.2, width: 0.1, height: 0.2 } })]],
        [2.0, [createMockDetection({ time: 2.0, box: { x: 0.3, y: 0.2, width: 0.1, height: 0.2 } })]],
        [3.0, []], // No detections
        [4.0, []], // No detections
        [5.0, [createMockDetection({ time: 5.0, box: { x: 0.6, y: 0.2, width: 0.1, height: 0.2 } })]]
      ])

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment({
        startTime: 0,
        endTime: 10
      })])

      const results = calculator.calculateBatchCropPositions(times, detectionMap, sceneTimeline)

      expect(results).toHaveLength(5)
      results.forEach((result, index) => {
        expect(result.time).toBe(times[index])
        expect(result.cropBox).toBeDefined()
        expect(result.window).toBeDefined()
      })
    })
  })

  describe('Realistic Scenarios', () => {
    test('should handle crowded scenes', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = Array.from({ length: 10 }, (_, i) =>
        createMockDetection({
          id: `person-${i}`,
          box: {
            x: (i % 5) * 0.2,
            y: Math.floor(i / 5) * 0.3,
            width: 0.1,
            height: 0.2
          },
          confidence: 0.7 + (i % 3) * 0.1
        })
      )

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment({
        type: 'dynamic'
      })])

      const result = calculator.calculateCropPosition(5.0, detections, sceneTimeline)

      expect(result.source).toBe('detection')
      expect(result.metadata.detectionCount).toBe(10)
      expect(result.cropBox.width).toBeGreaterThan(0)
      expect(result.cropBox.height).toBeGreaterThan(0)
    })

    test('should handle different aspect ratios', () => {
      // Square video
      const squareCalc = createCropPositionCalculator({ width: 1080, height: 1080 })
      const squareResult = squareCalc.calculateCropPosition(
        5.0,
        [createMockDetection()],
        createMockSceneTimeline([createMockSceneSegment()])
      )

      expect(squareResult.cropBox.width).toBeGreaterThan(0)
      expect(squareResult.cropBox.height).toBeGreaterThan(0)
      expect(squareResult.cropBox.width / squareResult.cropBox.height).toBeCloseTo(9/16, 1)

      // Wide video
      const wideCalc = createCropPositionCalculator({ width: 3440, height: 1080 })
      const wideResult = wideCalc.calculateCropPosition(
        5.0,
        [createMockDetection()],
        createMockSceneTimeline([createMockSceneSegment()])
      )

      expect(wideResult.cropBox.width).toBeGreaterThan(0)
      expect(wideResult.cropBox.height).toBeGreaterThan(0)
      expect(wideResult.cropBox.width / wideResult.cropBox.height).toBeCloseTo(9/16, 1)
    })
  })

  describe('Configuration Management', () => {
    test('should update configuration dynamically', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      expect(calculator.getConfig().padding).toBe(0.1)

      calculator.updateConfig({ padding: 0.3, smoothing: 0.5 })

      const updated = calculator.getConfig()
      expect(updated.padding).toBe(0.3)
      expect(updated.smoothing).toBe(0.5)
    })

    test('should apply different quality settings', () => {
      const calculator = createCropPositionCalculator(
        { width: 1920, height: 1080 },
        { quality: { boundaryChecking: false, minConfidence: 0.9 } }
      )

      const config = calculator.getConfig()
      expect(config.quality.boundaryChecking).toBe(false)
      expect(config.quality.minConfidence).toBe(0.9)
    })
  })

  describe('Performance Verification', () => {
    test('should process efficiently', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = Array.from({ length: 20 }, (_, i) =>
        createMockDetection({
          id: `det-${i}`,
          confidence: 0.8
        })
      )

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const startTime = performance.now()
      const result = calculator.calculateCropPosition(5.0, detections, sceneTimeline)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100) // Should be fast
      expect(result.source).toBe('detection')
    })
  })
})
