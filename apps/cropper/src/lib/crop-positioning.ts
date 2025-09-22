import type {
  CropBox,
  CropKeyframe,
  CropPath,
  CropWindow,
  DetectionResult,
  SceneChangeResult
} from '../types'

import type { SceneTimeline, SceneSegment } from './scene-timeline'
import { compensateSceneChanges, type DelayCompensationResult } from './delay-compensation'

/**
 * Crop Position Calculator with Delay Compensation
 *
 * Calculates optimal crop positions for each frame with delay compensation,
 * scene-aware positioning, and smooth transitions.
 */

export interface CropPositioningConfig {
  /** Video dimensions */
  videoDimensions: { width: number; height: number }
  /** Target aspect ratio */
  targetAspectRatio: number
  /** Padding around detected subjects */
  padding: number
  /** Smoothing factor for transitions */
  smoothing: number
  /** Delay compensation configuration */
  delayCompensation: {
    enabled: boolean
    maxLookahead: number // frames
    predictionWindow: number // frames
  }
  /** Scene-aware positioning */
  sceneAwareness: {
    enabled: boolean
    transitionSmoothing: number
    motionPrediction: boolean
  }
  /** Quality settings */
  quality: {
    minConfidence: number
    fallbackStrategy: 'center' | 'previous' | 'interpolate'
    boundaryChecking: boolean
  }
}

export interface CropPositionResult {
  /** Time this crop applies to */
  time: number
  /** Calculated crop box */
  cropBox: CropBox
  /** Window configuration used */
  window: CropWindow
  /** Confidence score (0-1) */
  confidence: number
  /** Source of this crop position */
  source: 'detection' | 'interpolation' | 'fallback' | 'prediction'
  /** Processing metadata */
  metadata: {
    processingTime: number
    delayCompensation: number // frames compensated
    sceneSegmentId?: string
    detectionCount: number
  }
}

export interface CropPositioningContext {
  /** Current scene segment */
  currentSegment: SceneSegment
  /** Upcoming scene segments */
  upcomingSegments: SceneSegment[]
  /** Recent crop positions for smoothing */
  recentPositions: CropPositionResult[]
  /** Delay compensation results */
  compensationResults: DelayCompensationResult[]
}

export interface PositioningStrategy {
  /** Strategy name */
  name: string
  /** Priority score (higher = preferred) */
  priority: number
  /** Calculate crop position */
  calculate: (
    time: number,
    detections: DetectionResult[],
    context: CropPositioningContext,
    config: CropPositioningConfig
  ) => CropPositionResult | null
}

/**
 * Crop Position Calculator
 */
export class CropPositionCalculator {
  private config: CropPositioningConfig
  private strategies: PositioningStrategy[]

  constructor(config: CropPositioningConfig) {
    this.config = config
    this.strategies = this.createStrategies()
  }

  /**
   * Calculate crop position for a specific time
   */
  calculateCropPosition(
    time: number,
    detections: DetectionResult[],
    sceneTimeline: SceneTimeline,
    previousPositions: CropPositionResult[] = []
  ): CropPositionResult {
    const startTime = performance.now()

    // Find current scene segment
    const currentSegment = this.findCurrentSegment(time, sceneTimeline.segments)
    const upcomingSegments = sceneTimeline.segments.filter(
      seg => seg.startTime > time
    ).slice(0, 3) // Next 3 segments

    // Get delay compensation results
    const compensationResults = compensateSceneChanges(
      sceneTimeline.sceneChanges.filter(sc => sc.time <= time + 2.0), // Look ahead 2 seconds
      {
        processingDelayMs: 200,
        frameRate: 30,
        predictionBufferSize: 10,
        predictionThreshold: 0.6,
        maxCompensationFrames: 15,
        smoothingFactor: 0.3
      }
    )

    const context: CropPositioningContext = {
      currentSegment,
      upcomingSegments,
      recentPositions: previousPositions.slice(-5), // Last 5 positions
      compensationResults
    }

    // Try strategies in priority order
    for (const strategy of this.strategies) {
      const result = strategy.calculate(time, detections, context, this.config)
      if (result && result.confidence >= this.config.quality.minConfidence) {
        // Add processing metadata
        result.metadata.processingTime = performance.now() - startTime
        result.metadata.sceneSegmentId = currentSegment?.id

        // Apply boundary checking if enabled
        if (this.config.quality.boundaryChecking) {
          result.cropBox = this.ensureBoundaries(result.cropBox)
        }

        return result
      }
    }

    // Fallback strategy
    return this.createFallbackPosition(time, detections, context, startTime)
  }

  /**
   * Calculate crop positions for multiple time points
   */
  calculateBatchCropPositions(
    times: number[],
    detectionMap: Map<number, DetectionResult[]>,
    sceneTimeline: SceneTimeline
  ): CropPositionResult[] {
    const results: CropPositionResult[] = []
    let previousPositions: CropPositionResult[] = []

    for (const time of times.sort((a, b) => a - b)) {
      const detections = detectionMap.get(time) || []
      const result = this.calculateCropPosition(time, detections, sceneTimeline, previousPositions)
      results.push(result)
      previousPositions.push(result)

      // Maintain history size
      if (previousPositions.length > 10) {
        previousPositions = previousPositions.slice(-10)
      }
    }

    return results
  }

  /**
   * Create positioning strategies
   */
  private createStrategies(): PositioningStrategy[] {
    return [
      {
        name: 'subject_tracking',
        priority: 10,
        calculate: this.subjectTrackingStrategy.bind(this)
      },
      {
        name: 'scene_aware',
        priority: 8,
        calculate: this.sceneAwareStrategy.bind(this)
      },
      {
        name: 'motion_prediction',
        priority: 6,
        calculate: this.motionPredictionStrategy.bind(this)
      },
      {
        name: 'interpolation',
        priority: 4,
        calculate: this.interpolationStrategy.bind(this)
      }
    ]
  }

  /**
   * Subject tracking strategy - prioritizes keeping subjects in frame
   */
  private subjectTrackingStrategy(
    time: number,
    detections: DetectionResult[],
    context: CropPositioningContext,
    config: CropPositioningConfig
  ): CropPositionResult | null {
    if (detections.length === 0) return null

    // Filter high-confidence detections
    const validDetections = detections.filter(d =>
      d.confidence > 0.6 && ['person', 'face'].includes(d.label)
    )

    if (validDetections.length === 0) return null

    // Calculate weighted center of all subjects
    let totalWeight = 0
    let centerX = 0
    let centerY = 0

    for (const detection of validDetections) {
      const weight = detection.confidence
      centerX += (detection.box.x + detection.box.width / 2) * weight
      centerY += (detection.box.y + detection.box.height / 2) * weight
      totalWeight += weight
    }

    centerX /= totalWeight
    centerY /= totalWeight

    // Calculate crop window to include all subjects with padding
    const cropBox = this.calculateSubjectCropBox(validDetections, centerX, centerY, config)

    // Convert to window coordinates
    const window = this.cropBoxToWindow(cropBox, config.videoDimensions)

    return {
      time,
      cropBox,
      window,
      confidence: Math.min(...validDetections.map(d => d.confidence)),
      source: 'detection',
      metadata: {
        processingTime: 0, // Will be set by caller
        delayCompensation: 0,
        detectionCount: validDetections.length
      }
    }
  }

  /**
   * Scene-aware strategy - considers scene changes and transitions
   */
  private sceneAwareStrategy(
    time: number,
    detections: DetectionResult[],
    context: CropPositioningContext,
    config: CropPositioningConfig
  ): CropPositionResult | null {
    const { currentSegment, upcomingSegments } = context

    if (!currentSegment) return null

    // Adjust positioning based on scene type
    let smoothing = config.smoothing
    let padding = config.padding

    switch (currentSegment.type) {
      case 'transition':
        // More aggressive smoothing during transitions
        smoothing *= 1.5
        padding *= 1.2
        break
      case 'dynamic':
        // Less smoothing for dynamic scenes
        smoothing *= 0.7
        break
      case 'static':
        // More smoothing for static scenes
        smoothing *= 1.2
        padding *= 0.9
        break
    }

    // Use subject tracking with modified parameters
    const modifiedConfig = { ...config, smoothing, padding }
    return this.subjectTrackingStrategy(time, detections, context, modifiedConfig)
  }

  /**
   * Motion prediction strategy - predicts subject movement
   */
  private motionPredictionStrategy(
    time: number,
    detections: DetectionResult[],
    context: CropPositioningContext,
    config: CropPositioningConfig
  ): CropPositionResult | null {
    const { recentPositions } = context

    if (recentPositions.length < 2) return null

    // Calculate motion vectors from recent positions
    const motionVectors = this.calculateMotionVectors(recentPositions)

    if (motionVectors.length === 0) return null

    // Predict next position
    const lastPosition = recentPositions[recentPositions.length - 1]
    const avgMotionX = motionVectors.reduce((sum, v) => sum + v.x, 0) / motionVectors.length
    const avgMotionY = motionVectors.reduce((sum, v) => sum + v.y, 0) / motionVectors.length

    // Predict next crop box
    const predictedBox: CropBox = {
      x: lastPosition.cropBox.x + avgMotionX * 0.1, // Scale motion
      y: lastPosition.cropBox.y + avgMotionY * 0.1,
      width: lastPosition.cropBox.width,
      height: lastPosition.cropBox.height
    }

    // Clamp to valid range
    const clampedBox = this.ensureBoundaries(predictedBox)
    const window = this.cropBoxToWindow(clampedBox, config.videoDimensions)

    return {
      time,
      cropBox: clampedBox,
      window,
      confidence: 0.7, // Lower confidence for predictions
      source: 'prediction',
      metadata: {
        processingTime: 0,
        delayCompensation: 0,
        detectionCount: 0
      }
    }
  }

  /**
   * Interpolation strategy - smooth transitions between known positions
   */
  private interpolationStrategy(
    time: number,
    detections: DetectionResult[],
    context: CropPositioningContext,
    config: CropPositioningConfig
  ): CropPositionResult | null {
    const { recentPositions } = context

    if (recentPositions.length < 2) return null

    // Find positions before and after current time
    const before = recentPositions
      .filter(p => p.time <= time)
      .sort((a, b) => b.time - a.time)[0]

    const after = recentPositions
      .filter(p => p.time >= time)
      .sort((a, b) => a.time - b.time)[0]

    if (!before || !after || before === after) return null

    // Linear interpolation
    const timeRatio = (time - before.time) / (after.time - before.time)

    const interpolatedBox: CropBox = {
      x: before.cropBox.x + (after.cropBox.x - before.cropBox.x) * timeRatio,
      y: before.cropBox.y + (after.cropBox.y - before.cropBox.y) * timeRatio,
      width: before.cropBox.width + (after.cropBox.width - before.cropBox.width) * timeRatio,
      height: before.cropBox.height + (after.cropBox.height - before.cropBox.height) * timeRatio
    }

    const clampedBox = this.ensureBoundaries(interpolatedBox)
    const window = this.cropBoxToWindow(clampedBox, config.videoDimensions)
    const confidence = Math.min(before.confidence, after.confidence) * 0.9

    return {
      time,
      cropBox: clampedBox,
      window,
      confidence,
      source: 'interpolation',
      metadata: {
        processingTime: 0,
        delayCompensation: 0,
        detectionCount: 0
      }
    }
  }

  /**
   * Create fallback position when all strategies fail
   */
  private createFallbackPosition(
    time: number,
    detections: DetectionResult[],
    context: CropPositioningContext,
    startTime: number
  ): CropPositionResult {
    const { currentSegment, recentPositions } = context

    let cropBox: CropBox
    let source: CropPositionResult['source'] = 'fallback'

    switch (this.config.quality.fallbackStrategy) {
      case 'previous':
        if (recentPositions.length > 0) {
          cropBox = { ...recentPositions[recentPositions.length - 1].cropBox }
          source = 'interpolation'
        } else {
          cropBox = this.createCenterCrop()
        }
        break

      case 'interpolate':
        const interpolated = this.interpolationStrategy(time, detections, context, this.config)
        if (interpolated) {
          return interpolated
        } else {
          cropBox = this.createCenterCrop()
        }
        break

      case 'center':
      default:
        cropBox = this.createCenterCrop()
        break
    }

    const window = this.cropBoxToWindow(cropBox, this.config.videoDimensions)

    return {
      time,
      cropBox,
      window,
      confidence: 0.3, // Low confidence for fallback
      source,
      metadata: {
        processingTime: performance.now() - startTime,
        delayCompensation: 0,
        sceneSegmentId: currentSegment?.id,
        detectionCount: detections.length
      }
    }
  }

  /**
   * Calculate crop box that includes all subjects
   */
  private calculateSubjectCropBox(
    detections: DetectionResult[],
    centerX: number,
    centerY: number,
    config: CropPositioningConfig
  ): CropBox {
    // Find bounding box of all detections
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const detection of detections) {
      minX = Math.min(minX, detection.box.x)
      minY = Math.min(minY, detection.box.y)
      maxX = Math.max(maxX, detection.box.x + detection.box.width)
      maxY = Math.max(maxY, detection.box.y + detection.box.height)
    }

    // Add padding
    const paddingX = (maxX - minX) * config.padding
    const paddingY = (maxY - minY) * config.padding

    minX = Math.max(0, minX - paddingX)
    minY = Math.max(0, minY - paddingY)
    maxX = Math.min(1, maxX + paddingX)
    maxY = Math.min(1, maxY + paddingY)

    // Ensure aspect ratio
    const width = maxX - minX
    const height = maxY - minY
    const currentRatio = width / height
    const targetRatio = config.targetAspectRatio

    if (currentRatio > targetRatio) {
      // Too wide, increase height
      const newHeight = width / targetRatio
      const heightDiff = (newHeight - height) / 2
      minY = Math.max(0, minY - heightDiff)
      maxY = Math.min(1, maxY + heightDiff)
    } else {
      // Too tall, increase width
      const newWidth = height * targetRatio
      const widthDiff = (newWidth - width) / 2
      minX = Math.max(0, minX - widthDiff)
      maxX = Math.min(1, maxX + widthDiff)
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * Convert crop box to window coordinates
   */
  private cropBoxToWindow(cropBox: CropBox, videoDimensions: { width: number; height: number }): CropWindow {
    const { width: videoWidth, height: videoHeight } = videoDimensions

    // Convert from normalized coordinates to window coordinates
    const focusX = cropBox.x + cropBox.width / 2
    const focusY = cropBox.y + cropBox.height / 2
    const scale = Math.max(cropBox.width / (videoWidth / videoHeight), cropBox.height)

    return {
      focusX,
      focusY,
      scale: Math.max(0.1, Math.min(1, scale))
    }
  }

  /**
   * Create center crop as fallback
   */
  private createCenterCrop(): CropBox {
    const targetRatio = this.config.targetAspectRatio
    const videoRatio = this.config.videoDimensions.width / this.config.videoDimensions.height

    let width, height, x, y

    if (videoRatio > targetRatio) {
      // Video is wider, crop width
      height = 1
      width = targetRatio / videoRatio
      x = (1 - width) / 2
      y = 0
    } else {
      // Video is taller, crop height
      width = 1
      height = videoRatio / targetRatio
      x = 0
      y = (1 - height) / 2
    }

    return { x, y, width, height }
  }

  /**
   * Ensure crop box stays within video boundaries
   */
  private ensureBoundaries(cropBox: CropBox): CropBox {
    return {
      x: Math.max(0, Math.min(1 - cropBox.width, cropBox.x)),
      y: Math.max(0, Math.min(1 - cropBox.height, cropBox.y)),
      width: Math.max(0.1, Math.min(1, cropBox.width)),
      height: Math.max(0.1, Math.min(1, cropBox.height))
    }
  }

  /**
   * Calculate motion vectors from recent positions
   */
  private calculateMotionVectors(positions: CropPositionResult[]): Array<{ x: number; y: number }> {
    const vectors: Array<{ x: number; y: number }> = []

    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1]
      const curr = positions[i]

      vectors.push({
        x: curr.cropBox.x - prev.cropBox.x,
        y: curr.cropBox.y - prev.cropBox.y
      })
    }

    return vectors
  }

  /**
   * Find current scene segment for a given time
   */
  private findCurrentSegment(time: number, segments: SceneSegment[]): SceneSegment | undefined {
    return segments.find(segment =>
      time >= segment.startTime && time < segment.endTime
    )
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<CropPositioningConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  getConfig(): CropPositioningConfig {
    return this.config
  }
}

/**
 * Default crop positioning configuration
 */
export const DEFAULT_CROP_POSITIONING_CONFIG: Omit<CropPositioningConfig, 'videoDimensions'> = {
  targetAspectRatio: 9 / 16,
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
  }
}

/**
 * Create crop position calculator with default config
 */
export function createCropPositionCalculator(
  videoDimensions: { width: number; height: number },
  config?: Partial<CropPositioningConfig>
): CropPositionCalculator {
  return new CropPositionCalculator({
    ...DEFAULT_CROP_POSITIONING_CONFIG,
    ...config,
    videoDimensions
  })
}
