import {
  CropPositionCalculator,
  createCropPositionCalculator,
  DEFAULT_CROP_POSITIONING_CONFIG,
  type CropPositioningConfig,
  type CropPositionResult,
  type PositioningStrategy,
  type CropPositioningContext
} from '../lib/crop-positioning'
import type { DetectionResult, CropBox, SceneTimeline, SceneSegment } from '../types'

/**
 * Branch Coverage Tests for Crop Positioning System
 * Tests every if/else path, edge case, integration point, and error scenario
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

function createMockConfig(overrides: Partial<CropPositioningConfig> = {}): CropPositioningConfig {
  return {
    videoDimensions: { width: 1920, height: 1080 },
    targetAspectRatio: 9/16,
    padding: 0.1,
    smoothing: 0.25,
    delayCompensation: {
      enabled: true,
      maxLookahead: 10,
      predictionWindow: 5
    },
    sceneAwareness: {
      enabled: true,
      transitionSmoothing: 0.8,
      motionPrediction: true
    },
    quality: {
      minConfidence: 0.5,
      fallbackStrategy: 'interpolate',
      boundaryChecking: true
    },
    ...overrides
  }
}

describe('CropPositionCalculator - Branch Coverage Tests', () => {
  describe('calculateCropPosition - Main Method Branches', () => {
    test('should handle sceneTimeline with no segments', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [createMockDetection()]
      const emptyTimeline = createMockSceneTimeline([]) // Empty segments

      const result = calculator.calculateCropPosition(5.0, detections, emptyTimeline)

      expect(result).toBeDefined()
      expect(result.metadata.sceneSegmentId).toBeUndefined()
    })

    test('should handle sceneTimeline with segments but none matching time', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [createMockDetection()]
      const timelineWithSegments = createMockSceneTimeline([
        createMockSceneSegment({ startTime: 0, endTime: 2 }), // Before time
        createMockSceneSegment({ startTime: 8, endTime: 10 }) // After time
      ])

      const result = calculator.calculateCropPosition(5.0, detections, timelineWithSegments)

      expect(result).toBeDefined()
      expect(result.metadata.sceneSegmentId).toBeUndefined()
    })

    test('should handle boundary checking enabled (true path)', () => {
      const calculator = createCropPositionCalculator(
        { width: 1920, height: 1080 },
        { quality: { boundaryChecking: true } }
      )

      const detections = [createMockDetection({
        box: { x: 0.95, y: 0.2, width: 0.1, height: 0.2 }
      })]

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = calculator.calculateCropPosition(5.0, detections, sceneTimeline)

      expect(result).toBeDefined()
      // Boundary checking should clamp the crop box
      expect(result.cropBox.x).toBeGreaterThanOrEqual(0)
      expect(result.cropBox.x + result.cropBox.width).toBeLessThanOrEqual(1)
    })

    test('should handle boundary checking disabled (false path)', () => {
      const calculator = createCropPositionCalculator(
        { width: 1920, height: 1080 },
        { quality: { boundaryChecking: false } }
      )

      const detections = [createMockDetection({
        box: { x: 0.95, y: 0.2, width: 0.1, height: 0.2 }
      })]

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = calculator.calculateCropPosition(5.0, detections, sceneTimeline)

      expect(result).toBeDefined()
      // Without boundary checking, might extend beyond boundaries
      expect(result.cropBox).toBeDefined()
    })
  })

  describe('Subject Tracking Strategy - All Branches', () => {
    test('should return null when no detections (early return)', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      // Access private method through reflection for testing
      const strategies = (calculator as any).strategies
      const subjectTrackingStrategy = strategies.find((s: any) => s.name === 'subject_tracking')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment(),
        upcomingSegments: [],
        recentPositions: [],
        compensationResults: []
      }

      const config = createMockConfig()
      const result = subjectTrackingStrategy.calculate(5.0, [], context, config)

      expect(result).toBeNull()
    })

    test('should return null when all detections have low confidence', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [
        createMockDetection({ confidence: 0.3, label: 'person' }), // Below 0.6 threshold
        createMockDetection({ confidence: 0.4, label: 'face' })   // Below 0.6 threshold
      ]

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const subjectTrackingStrategy = strategies.find((s: any) => s.name === 'subject_tracking')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment(),
        upcomingSegments: [],
        recentPositions: [],
        compensationResults: []
      }

      const config = createMockConfig()
      const result = subjectTrackingStrategy.calculate(5.0, detections, context, config)

      expect(result).toBeNull()
    })

    test('should return null when detections are not person or face', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [
        createMockDetection({ confidence: 0.9, label: 'car' }), // Valid confidence but wrong label
        createMockDetection({ confidence: 0.8, label: 'dog' })  // Valid confidence but wrong label
      ]

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const subjectTrackingStrategy = strategies.find((s: any) => s.name === 'subject_tracking')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment(),
        upcomingSegments: [],
        recentPositions: [],
        compensationResults: []
      }

      const config = createMockConfig()
      const result = subjectTrackingStrategy.calculate(5.0, detections, context, config)

      expect(result).toBeNull()
    })

    test('should handle single valid detection', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [
        createMockDetection({
          confidence: 0.9,
          label: 'person',
          box: { x: 0.4, y: 0.3, width: 0.2, height: 0.4 }
        })
      ]

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const subjectTrackingStrategy = strategies.find((s: any) => s.name === 'subject_tracking')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment(),
        upcomingSegments: [],
        recentPositions: [],
        compensationResults: []
      }

      const config = createMockConfig()
      const result = subjectTrackingStrategy.calculate(5.0, detections, context, config)

      expect(result).toBeDefined()
      expect(result!.source).toBe('detection')
      expect(result!.confidence).toBe(0.9)
    })

    test('should handle mixed valid and invalid detections', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [
        createMockDetection({ confidence: 0.9, label: 'person', box: { x: 0.2, y: 0.2, width: 0.1, height: 0.2 } }),
        createMockDetection({ confidence: 0.3, label: 'person', box: { x: 0.6, y: 0.4, width: 0.1, height: 0.2 } }), // Low confidence
        createMockDetection({ confidence: 0.8, label: 'car', box: { x: 0.4, y: 0.3, width: 0.1, height: 0.2 } })   // Wrong label
      ]

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const subjectTrackingStrategy = strategies.find((s: any) => s.name === 'subject_tracking')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment(),
        upcomingSegments: [],
        recentPositions: [],
        compensationResults: []
      }

      const config = createMockConfig()
      const result = subjectTrackingStrategy.calculate(5.0, detections, context, config)

      expect(result).toBeDefined()
      expect(result!.source).toBe('detection')
      // Should only consider valid detections (person with high confidence)
      expect(result!.metadata.detectionCount).toBe(1)
    })
  })

  describe('Scene-Aware Strategy - Branch Coverage', () => {
    test('should handle missing current segment', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [createMockDetection()]
      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const sceneAwareStrategy = strategies.find((s: any) => s.name === 'scene_aware')

      const context: CropPositioningContext = {
        currentSegment: undefined, // No current segment
        upcomingSegments: [],
        recentPositions: [],
        compensationResults: []
      }

      const config = createMockConfig()
      const result = sceneAwareStrategy.calculate(5.0, detections, context, config)

      expect(result).toBeNull()
    })

    test('should handle transition scene type', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [createMockDetection()]
      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const sceneAwareStrategy = strategies.find((s: any) => s.name === 'scene_aware')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment({ type: 'transition' }),
        upcomingSegments: [],
        recentPositions: [],
        compensationResults: []
      }

      const config = createMockConfig()
      const result = sceneAwareStrategy.calculate(5.0, detections, context, config)

      expect(result).toBeDefined()
      expect(result!.source).toBe('detection')
    })

    test('should handle dynamic scene type', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [createMockDetection()]
      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const sceneAwareStrategy = strategies.find((s: any) => s.name === 'scene_aware')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment({ type: 'dynamic' }),
        upcomingSegments: [],
        recentPositions: [],
        compensationResults: []
      }

      const config = createMockConfig()
      const result = sceneAwareStrategy.calculate(5.0, detections, context, config)

      expect(result).toBeDefined()
      expect(result!.source).toBe('detection')
    })

    test('should handle static scene type', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [createMockDetection()]
      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const sceneAwareStrategy = strategies.find((s: any) => s.name === 'scene_aware')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment({ type: 'static' }),
        upcomingSegments: [],
        recentPositions: [],
        compensationResults: []
      }

      const config = createMockConfig()
      const result = sceneAwareStrategy.calculate(5.0, detections, context, config)

      expect(result).toBeDefined()
      expect(result!.source).toBe('detection')
    })

    test('should handle action scene type (default case)', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [createMockDetection()]
      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const sceneAwareStrategy = strategies.find((s: any) => s.name === 'scene_aware')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment({ type: 'action' }),
        upcomingSegments: [],
        recentPositions: [],
        compensationResults: []
      }

      const config = createMockConfig()
      const result = sceneAwareStrategy.calculate(5.0, detections, context, config)

      expect(result).toBeDefined()
      expect(result!.source).toBe('detection')
    })
  })

  describe('Motion Prediction Strategy - Branch Coverage', () => {
    test('should return null when insufficient history', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const motionPredictionStrategy = strategies.find((s: any) => s.name === 'motion_prediction')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment(),
        upcomingSegments: [],
        recentPositions: [], // No recent positions
        compensationResults: []
      }

      const config = createMockConfig()
      const result = motionPredictionStrategy.calculate(5.0, [], context, config)

      expect(result).toBeNull()
    })

    test('should return null when only one recent position', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const motionPredictionStrategy = strategies.find((s: any) => s.name === 'motion_prediction')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment(),
        upcomingSegments: [],
        recentPositions: [
          {
            time: 4.0,
            cropBox: { x: 0.2, y: 0.1, width: 0.5, height: 1.0 },
            window: { focusX: 0.45, focusY: 0.5, scale: 0.5 },
            confidence: 0.8,
            source: 'detection',
            metadata: { processingTime: 10, delayCompensation: 0, detectionCount: 1 }
          }
        ], // Only one position
        compensationResults: []
      }

      const config = createMockConfig()
      const result = motionPredictionStrategy.calculate(5.0, [], context, config)

      expect(result).toBeNull()
    })

    test('should predict motion with sufficient history', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const motionPredictionStrategy = strategies.find((s: any) => s.name === 'motion_prediction')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment(),
        upcomingSegments: [],
        recentPositions: [
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
        ],
        compensationResults: []
      }

      const config = createMockConfig()
      const result = motionPredictionStrategy.calculate(5.0, [], context, config)

      expect(result).toBeDefined()
      expect(result!.source).toBe('prediction')
      expect(result!.confidence).toBe(0.7) // Lower confidence for predictions
    })
  })

  describe('Interpolation Strategy - Branch Coverage', () => {
    test('should return null when insufficient history', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const interpolationStrategy = strategies.find((s: any) => s.name === 'interpolation')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment(),
        upcomingSegments: [],
        recentPositions: [], // No recent positions
        compensationResults: []
      }

      const config = createMockConfig()
      const result = interpolationStrategy.calculate(5.0, [], context, config)

      expect(result).toBeNull()
    })

    test('should return null when only one recent position', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const interpolationStrategy = strategies.find((s: any) => s.name === 'interpolation')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment(),
        upcomingSegments: [],
        recentPositions: [
          {
            time: 4.0,
            cropBox: { x: 0.2, y: 0.1, width: 0.5, height: 1.0 },
            window: { focusX: 0.45, focusY: 0.5, scale: 0.5 },
            confidence: 0.8,
            source: 'detection',
            metadata: { processingTime: 10, delayCompensation: 0, detectionCount: 1 }
          }
        ], // Only one position
        compensationResults: []
      }

      const config = createMockConfig()
      const result = interpolationStrategy.calculate(5.0, [], context, config)

      expect(result).toBeNull()
    })

    test('should return null when no positions before current time', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const interpolationStrategy = strategies.find((s: any) => s.name === 'interpolation')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment(),
        upcomingSegments: [],
        recentPositions: [
          {
            time: 6.0, // After current time
            cropBox: { x: 0.4, y: 0.1, width: 0.5, height: 1.0 },
            window: { focusX: 0.65, focusY: 0.5, scale: 0.5 },
            confidence: 0.8,
            source: 'detection',
            metadata: { processingTime: 10, delayCompensation: 0, detectionCount: 1 }
          }
        ],
        compensationResults: []
      }

      const config = createMockConfig()
      const result = interpolationStrategy.calculate(5.0, [], context, config)

      expect(result).toBeNull()
    })

    test('should return null when no positions after current time', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const interpolationStrategy = strategies.find((s: any) => s.name === 'interpolation')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment(),
        upcomingSegments: [],
        recentPositions: [
          {
            time: 4.0, // Before current time
            cropBox: { x: 0.2, y: 0.1, width: 0.5, height: 1.0 },
            window: { focusX: 0.45, focusY: 0.5, scale: 0.5 },
            confidence: 0.8,
            source: 'detection',
            metadata: { processingTime: 10, delayCompensation: 0, detectionCount: 1 }
          }
        ],
        compensationResults: []
      }

      const config = createMockConfig()
      const result = interpolationStrategy.calculate(5.0, [], context, config)

      expect(result).toBeNull()
    })

    test('should interpolate when before and after positions exist', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const strategies = (calculator as any).strategies
      const interpolationStrategy = strategies.find((s: any) => s.name === 'interpolation')

      const context: CropPositioningContext = {
        currentSegment: createMockSceneSegment(),
        upcomingSegments: [],
        recentPositions: [
          {
            time: 4.0, // Before
            cropBox: { x: 0.2, y: 0.1, width: 0.5, height: 1.0 },
            window: { focusX: 0.45, focusY: 0.5, scale: 0.5 },
            confidence: 0.8,
            source: 'detection',
            metadata: { processingTime: 10, delayCompensation: 0, detectionCount: 1 }
          },
          {
            time: 6.0, // After
            cropBox: { x: 0.4, y: 0.1, width: 0.5, height: 1.0 },
            window: { focusX: 0.65, focusY: 0.5, scale: 0.5 },
            confidence: 0.8,
            source: 'detection',
            metadata: { processingTime: 10, delayCompensation: 0, detectionCount: 1 }
          }
        ],
        compensationResults: []
      }

      const config = createMockConfig()
      const result = interpolationStrategy.calculate(5.0, [], context, config)

      expect(result).toBeDefined()
      expect(result!.source).toBe('interpolation')
      expect(result!.cropBox.x).toBeCloseTo(0.3, 3) // Halfway between 0.2 and 0.4
    })
  })

  describe('createFallbackPosition - All Fallback Branches', () => {
    test('should use center fallback strategy', () => {
      const calculator = createCropPositionCalculator(
        { width: 1920, height: 1080 },
        { quality: { fallbackStrategy: 'center' } }
      )

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = calculator.calculateCropPosition(5.0, [], sceneTimeline)

      expect(result.source).toBe('fallback')
      expect(result.cropBox).toBeDefined()
      expect(result.cropBox.height).toBe(1.0)
    })

    test('should use previous fallback strategy when positions available', () => {
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

      expect(result.source).toBe('interpolation') // Previous strategy maps to interpolation
      expect(result.cropBox).toEqual(previousPositions[0].cropBox)
    })

    test('should use center fallback when previous strategy has no positions', () => {
      const calculator = createCropPositionCalculator(
        { width: 1920, height: 1080 },
        { quality: { fallbackStrategy: 'previous' } }
      )

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = calculator.calculateCropPosition(5.0, [], sceneTimeline, [])

      expect(result.source).toBe('fallback')
      expect(result.cropBox).toBeDefined()
    })

    test('should use interpolate fallback strategy', () => {
      const calculator = createCropPositionCalculator(
        { width: 1920, height: 1080 },
        { quality: { fallbackStrategy: 'interpolate' } }
      )

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

      expect(result.source).toBe('interpolation')
      expect(result.cropBox.x).toBeCloseTo(0.3, 3)
    })

    test('should use center fallback when interpolate strategy fails', () => {
      const calculator = createCropPositionCalculator(
        { width: 1920, height: 1080 },
        { quality: { fallbackStrategy: 'interpolate' } }
      )

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])
      const result = calculator.calculateCropPosition(5.0, [], sceneTimeline, [])

      expect(result.source).toBe('fallback')
      expect(result.cropBox).toBeDefined()
    })
  })

  describe('calculateBatchCropPositions - Batch Processing Branches', () => {
    test('should handle empty times array', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detectionMap = new Map<number, DetectionResult[]>()
      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment()])

      const results = calculator.calculateBatchCropPositions([], detectionMap, sceneTimeline)

      expect(results).toHaveLength(0)
    })

    test('should handle times array with duplicates', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const times = [1.0, 2.0, 1.0, 3.0] // Duplicate time
      const detectionMap = new Map([
        [1.0, [createMockDetection({ time: 1.0 })]],
        [2.0, [createMockDetection({ time: 2.0 })]],
        [3.0, [createMockDetection({ time: 3.0 })]]
      ])

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment({
        startTime: 0,
        endTime: 10
      })])

      const results = calculator.calculateBatchCropPositions(times, detectionMap, sceneTimeline)

      expect(results).toHaveLength(4) // Should include duplicate
      expect(results[0].time).toBe(1.0)
      expect(results[1].time).toBe(1.0) // Duplicate
      expect(results[2].time).toBe(2.0)
      expect(results[3].time).toBe(3.0)
    })

    test('should handle missing detection data for some times', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const times = [1.0, 2.0, 3.0]
      const detectionMap = new Map([
        [1.0, [createMockDetection({ time: 1.0 })]],
        // Missing 2.0
        [3.0, [createMockDetection({ time: 3.0 })]]
      ])

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment({
        startTime: 0,
        endTime: 10
      })])

      const results = calculator.calculateBatchCropPositions(times, detectionMap, sceneTimeline)

      expect(results).toHaveLength(3)
      expect(results[0].time).toBe(1.0)
      expect(results[1].time).toBe(2.0)
      expect(results[2].time).toBe(3.0)

      // Time 2.0 should have empty detections and fall back
      expect(results[1].metadata.detectionCount).toBe(0)
    })

    test('should trigger history maintenance when positions exceed 10', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const times = Array.from({ length: 15 }, (_, i) => i + 1) // 1 to 15
      const detectionMap = new Map<number, DetectionResult[]>()

      times.forEach(time => {
        detectionMap.set(time, [createMockDetection({ time })])
      })

      const sceneTimeline = createMockSceneTimeline([createMockSceneSegment({
        startTime: 0,
        endTime: 20
      })])

      const results = calculator.calculateBatchCropPositions(times, detectionMap, sceneTimeline)

      expect(results).toHaveLength(15)
      // History maintenance should work without errors
      results.forEach((result, index) => {
        expect(result.time).toBe(times[index])
        expect(result.source).toBe('detection')
      })
    })
  })

  describe('ensureBoundaries - Boundary Checking Branches', () => {
    test('should not modify crop box when within boundaries', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const cropBox: CropBox = { x: 0.2, y: 0.1, width: 0.5, height: 0.8 }

      // Access private method through reflection
      const ensureBoundaries = (calculator as any).ensureBoundaries.bind(calculator)
      const result = ensureBoundaries(cropBox)

      expect(result).toEqual(cropBox)
    })

    test('should clamp negative x coordinate', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const cropBox: CropBox = { x: -0.1, y: 0.1, width: 0.5, height: 0.8 }

      const ensureBoundaries = (calculator as any).ensureBoundaries.bind(calculator)
      const result = ensureBoundaries(cropBox)

      expect(result.x).toBe(0)
      expect(result.width).toBe(0.5)
    })

    test('should clamp x + width exceeding 1', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const cropBox: CropBox = { x: 0.8, y: 0.1, width: 0.5, height: 0.8 }

      const ensureBoundaries = (calculator as any).ensureBoundaries.bind(calculator)
      const result = ensureBoundaries(cropBox)

      expect(result.x).toBe(0.5) // 1 - 0.5
      expect(result.width).toBe(0.5)
    })

    test('should clamp negative y coordinate', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const cropBox: CropBox = { x: 0.2, y: -0.1, width: 0.5, height: 0.8 }

      const ensureBoundaries = (calculator as any).ensureBoundaries.bind(calculator)
      const result = ensureBoundaries(cropBox)

      expect(result.y).toBe(0)
      expect(result.height).toBe(0.8)
    })

    test('should clamp y + height exceeding 1', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const cropBox: CropBox = { x: 0.2, y: 0.8, width: 0.5, height: 0.5 }

      const ensureBoundaries = (calculator as any).ensureBoundaries.bind(calculator)
      const result = ensureBoundaries(cropBox)

      expect(result.y).toBe(0.5) // 1 - 0.5
      expect(result.height).toBe(0.5)
    })

    test('should clamp width below minimum', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const cropBox: CropBox = { x: 0.2, y: 0.1, width: 0.05, height: 0.8 }

      const ensureBoundaries = (calculator as any).ensureBoundaries.bind(calculator)
      const result = ensureBoundaries(cropBox)

      expect(result.width).toBe(0.1) // Minimum width
    })

    test('should clamp height below minimum', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const cropBox: CropBox = { x: 0.2, y: 0.1, width: 0.5, height: 0.05 }

      const ensureBoundaries = (calculator as any).ensureBoundaries.bind(calculator)
      const result = ensureBoundaries(cropBox)

      expect(result.height).toBe(0.1) // Minimum height
    })
  })

  describe('findCurrentSegment - Scene Segment Lookup Branches', () => {
    test('should return undefined when no segments', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const segments: SceneSegment[] = []
      const findCurrentSegment = (calculator as any).findCurrentSegment.bind(calculator)

      const result = findCurrentSegment(5.0, segments)
      expect(result).toBeUndefined()
    })

    test('should return undefined when time before all segments', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const segments = [
        createMockSceneSegment({ startTime: 10, endTime: 20 }),
        createMockSceneSegment({ startTime: 20, endTime: 30 })
      ]

      const findCurrentSegment = (calculator as any).findCurrentSegment.bind(calculator)
      const result = findCurrentSegment(5.0, segments)

      expect(result).toBeUndefined()
    })

    test('should return undefined when time after all segments', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const segments = [
        createMockSceneSegment({ startTime: 0, endTime: 5 }),
        createMockSceneSegment({ startTime: 5, endTime: 10 })
      ]

      const findCurrentSegment = (calculator as any).findCurrentSegment.bind(calculator)
      const result = findCurrentSegment(15.0, segments)

      expect(result).toBeUndefined()
    })

    test('should find segment when time is within segment bounds', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const targetSegment = createMockSceneSegment({ startTime: 5, endTime: 10, id: 'target' })
      const segments = [
        createMockSceneSegment({ startTime: 0, endTime: 5 }),
        targetSegment,
        createMockSceneSegment({ startTime: 10, endTime: 15 })
      ]

      const findCurrentSegment = (calculator as any).findCurrentSegment.bind(calculator)
      const result = findCurrentSegment(7.5, segments)

      expect(result).toEqual(targetSegment)
    })

    test('should find first segment when time equals start time', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const targetSegment = createMockSceneSegment({ startTime: 5, endTime: 10, id: 'target' })
      const segments = [
        createMockSceneSegment({ startTime: 0, endTime: 5 }),
        targetSegment
      ]

      const findCurrentSegment = (calculator as any).findCurrentSegment.bind(calculator)
      const result = findCurrentSegment(5.0, segments)

      expect(result).toEqual(targetSegment)
    })

    test('should not find segment when time equals end time (exclusive)', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const segments = [
        createMockSceneSegment({ startTime: 0, endTime: 5 }),
        createMockSceneSegment({ startTime: 5, endTime: 10 })
      ]

      const findCurrentSegment = (calculator as any).findCurrentSegment.bind(calculator)
      const result = findCurrentSegment(5.0, segments)

      // Should find the second segment since time >= startTime and < endTime
      expect(result).toBeDefined()
      expect(result!.startTime).toBe(5)
    })
  })

  describe('calculateSubjectCropBox - Subject Bounding Box Calculation', () => {
    test('should handle single detection', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [
        createMockDetection({
          box: { x: 0.4, y: 0.3, width: 0.2, height: 0.4 }
        })
      ]

      const calculateSubjectCropBox = (calculator as any).calculateSubjectCropBox.bind(calculator)

      const config = createMockConfig()
      const result = calculateSubjectCropBox(detections, 0.5, 0.5, config)

      expect(result).toBeDefined()
      expect(result.x).toBeGreaterThanOrEqual(0)
      expect(result.width).toBeGreaterThan(0)
    })

    test('should handle multiple overlapping detections', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [
        createMockDetection({ box: { x: 0.2, y: 0.2, width: 0.3, height: 0.3 } }),
        createMockDetection({ box: { x: 0.3, y: 0.3, width: 0.2, height: 0.2 } })
      ]

      const calculateSubjectCropBox = (calculator as any).calculateSubjectCropBox.bind(calculator)

      const config = createMockConfig()
      const result = calculateSubjectCropBox(detections, 0.35, 0.35, config)

      expect(result).toBeDefined()
      expect(result.x).toBeLessThanOrEqual(0.2) // Should include leftmost detection
      expect(result.width).toBeGreaterThanOrEqual(0.3) // Should span the width
    })

    test('should apply padding to bounding box', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [
        createMockDetection({ box: { x: 0.4, y: 0.4, width: 0.2, height: 0.2 } })
      ]

      const calculateSubjectCropBox = (calculator as any).calculateSubjectCropBox.bind(calculator)

      const config = createMockConfig({ padding: 0.2 }) // Higher padding
      const result = calculateSubjectCropBox(detections, 0.5, 0.5, config)

      // With padding, the box should be larger than the original detection
      expect(result.width).toBeGreaterThan(0.2)
      expect(result.height).toBeGreaterThan(0.2)
    })

    test('should adjust aspect ratio when current ratio > target ratio', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [
        createMockDetection({ box: { x: 0.1, y: 0.1, width: 0.8, height: 0.2 } }) // Wide detection
      ]

      const calculateSubjectCropBox = (calculator as any).calculateSubjectCropBox.bind(calculator)

      const config = createMockConfig()
      const result = calculateSubjectCropBox(detections, 0.5, 0.2, config)

      // Should increase height to match aspect ratio
      expect(result.height).toBeGreaterThan(0.2)
    })

    test('should adjust aspect ratio when current ratio < target ratio', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const detections = [
        createMockDetection({ box: { x: 0.4, y: 0.1, width: 0.2, height: 0.8 } }) // Tall detection
      ]

      const calculateSubjectCropBox = (calculator as any).calculateSubjectCropBox.bind(calculator)

      const config = createMockConfig()
      const result = calculateSubjectCropBox(detections, 0.5, 0.5, config)

      // Should increase width to match aspect ratio
      expect(result.width).toBeGreaterThan(0.2)
    })
  })

  describe('cropBoxToWindow - Coordinate Conversion', () => {
    test('should convert crop box to window coordinates', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const cropBox: CropBox = { x: 0.2, y: 0.1, width: 0.6, height: 0.8 }

      const cropBoxToWindow = (calculator as any).cropBoxToWindow.bind(calculator)
      const result = cropBoxToWindow(cropBox, { width: 1920, height: 1080 })

      expect(result).toBeDefined()
      expect(result.focusX).toBeCloseTo(0.5, 3) // Center of crop box
      expect(result.focusY).toBeCloseTo(0.5, 3) // Center of crop box
      expect(result.scale).toBeGreaterThan(0)
      expect(result.scale).toBeLessThanOrEqual(1)
    })

    test('should handle minimum scale constraint', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 })

      const cropBox: CropBox = { x: 0.0, y: 0.0, width: 0.01, height: 0.01 } // Very small

      const cropBoxToWindow = (calculator as any).cropBoxToWindow.bind(calculator)
      const result = cropBoxToWindow(cropBox, { width: 1920, height: 1080 })

      expect(result.scale).toBeGreaterThanOrEqual(0.1) // Minimum scale
    })
  })

  describe('createCenterCrop - Fallback Crop Generation', () => {
    test('should create center crop for wide video', () => {
      const calculator = createCropPositionCalculator({ width: 1920, height: 1080 }) // 16:9 aspect ratio

      const createCenterCrop = (calculator as any).createCenterCrop.bind(calculator)
      const result = createCenterCrop()

      expect(result).toBeDefined()
      expect(result.y).toBe(0) // Full height for wide video
      expect(result.height).toBe(1.0)
      expect(result.x).toBeGreaterThan(0) // Centered horizontally
      expect(result.width).toBeLessThan(1.0)
    })

    test('should create center crop for tall video', () => {
      const calculator = createCropPositionCalculator({ width: 1080, height: 1920 }) // 9:16 aspect ratio

      const createCenterCrop = (calculator as any).createCenterCrop.bind(calculator)
      const result = createCenterCrop()

      expect(result).toBeDefined()
      // Video ratio (0.5625) <= target ratio (0.5625), so crop height
      expect(result.x).toBe(0) // Full width
      expect(result.width).toBe(1.0)
      expect(result.y).toBe(0) // Top-aligned when height = 1
      expect(result.height).toBe(1.0) // Full height when ratios are equal
    })

    test('should create center crop for square video', () => {
      const calculator = createCropPositionCalculator({ width: 1080, height: 1080 }) // 1:1 aspect ratio

      const createCenterCrop = (calculator as any).createCenterCrop.bind(calculator)
      const result = createCenterCrop()

      expect(result).toBeDefined()
      // Video ratio (1) > target ratio (0.5625), so crop width
      expect(result.x).toBeCloseTo(0.21875, 4) // Centered: (1 - 0.5625) / 2
      expect(result.width).toBeCloseTo(0.5625, 4) // targetRatio / videoRatio
      expect(result.y).toBe(0) // Full height
      expect(result.height).toBe(1.0)
    })
  })
})
