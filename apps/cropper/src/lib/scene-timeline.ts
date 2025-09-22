import type { SceneChangeResult } from '../types'
import { compensateSceneChanges, type DelayCompensationConfig } from './delay-compensation'

/**
 * Scene Change Timeline Generator
 *
 * Creates structured timelines from scene change detections with support for
 * temporal smoothing, clustering, and transition planning.
 */

export interface SceneTimelineConfig {
  /** Minimum time gap between scene changes (seconds) */
  minSceneGap: number
  /** Maximum time gap to consider as same scene (seconds) */
  maxSceneGap: number
  /** Smoothing window size for temporal filtering */
  smoothingWindow: number
  /** Threshold for merging nearby scene changes */
  mergeThreshold: number
  /** Delay compensation configuration */
  delayCompensation: DelayCompensationConfig
  /** Enable temporal clustering */
  enableClustering: boolean
  /** Minimum confidence for scene changes to be included */
  minConfidence: number
}

export interface SceneSegment {
  /** Unique segment ID */
  id: string
  /** Start time in seconds */
  startTime: number
  /** End time in seconds */
  endTime: number
  /** Duration in seconds */
  duration: number
  /** Scene change that starts this segment */
  startSceneChange?: SceneChangeResult
  /** Scene change that ends this segment */
  endSceneChange?: SceneChangeResult
  /** Segment type classification */
  type: 'static' | 'transition' | 'dynamic'
  /** Motion characteristics */
  motion: {
    averageMagnitude: number
    direction: number // radians
    isCameraMovement: boolean
    stability: number // 0-1, higher = more stable
  }
  /** Confidence score */
  confidence: number
  /** Processing metadata */
  metadata: {
    frameCount: number
    processingTime: number
    source: 'detection' | 'clustering' | 'interpolation'
  }
}

export interface SceneTimeline {
  /** Timeline ID */
  id: string
  /** Video duration */
  duration: number
  /** All scene segments in chronological order */
  segments: SceneSegment[]
  /** Key scene change events */
  sceneChanges: SceneChangeResult[]
  /** Timeline statistics */
  stats: {
    totalSegments: number
    averageSegmentDuration: number
    sceneChangeFrequency: number // changes per minute
    motionVariability: number
    temporalCoverage: number // percentage of video covered
  }
  /** Processing metadata */
  metadata: {
    createdAt: number
    config: SceneTimelineConfig
    processingTime: number
    version: string
  }
}

export interface SceneTransition {
  /** Transition ID */
  id: string
  /** Time of transition */
  time: number
  /** Type of transition */
  type: 'cut' | 'fade' | 'wipe' | 'dissolve'
  /** Transition duration */
  duration: number
  /** Confidence of transition detection */
  confidence: number
  /** Source segments */
  fromSegment?: SceneSegment
  toSegment?: SceneSegment
  /** Transition metadata */
  metadata: {
    motionDirection: number
    intensity: number
    complexity: number
  }
}

/**
 * Scene Timeline Generator
 */
export class SceneTimelineGenerator {
  private config: SceneTimelineConfig

  constructor(config: SceneTimelineConfig) {
    this.config = config
  }

  /**
   * Generate scene timeline from scene change detections
   */
  generateTimeline(
    sceneChanges: SceneChangeResult[],
    videoDuration: number
  ): SceneTimeline {
    const startTime = Date.now()

    // Apply delay compensation
    const compensatedChanges = compensateSceneChanges(
      sceneChanges,
      this.config.delayCompensation
    )

    // Filter and sort scene changes
    const filteredChanges = this.filterAndSortSceneChanges(sceneChanges)

    // Apply temporal smoothing
    const smoothedChanges = this.applyTemporalSmoothing(filteredChanges)

    // Cluster nearby scene changes
    const clusteredChanges = this.config.enableClustering
      ? this.clusterSceneChanges(smoothedChanges)
      : smoothedChanges

    // Generate segments
    const segments = this.generateSegments(clusteredChanges, videoDuration)

    // Classify segments
    const classifiedSegments = this.classifySegments(segments)

    // Calculate statistics
    const stats = this.calculateTimelineStats(classifiedSegments, videoDuration)

    const timeline: SceneTimeline = {
      id: `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      duration: videoDuration,
      segments: classifiedSegments,
      sceneChanges: clusteredChanges,
      stats,
      metadata: {
        createdAt: Date.now(),
        config: this.config,
        processingTime: Date.now() - startTime,
        version: '1.0.0'
      }
    }

    return timeline
  }

  /**
   * Filter and sort scene changes by confidence and time
   */
  private filterAndSortSceneChanges(sceneChanges: SceneChangeResult[]): SceneChangeResult[] {
    return sceneChanges
      .filter(change => change.metadata.thresholdUsed >= this.config.minConfidence)
      .sort((a, b) => a.time - b.time)
      .filter((change, index, array) => {
        // Remove duplicates within minimum gap
        if (index === 0) return true
        const prevChange = array[index - 1]
        return (change.time - prevChange.time) >= this.config.minSceneGap
      })
  }

  /**
   * Apply temporal smoothing to reduce noise
   */
  private applyTemporalSmoothing(sceneChanges: SceneChangeResult[]): SceneChangeResult[] {
    if (sceneChanges.length < 3 || this.config.smoothingWindow <= 1) {
      return sceneChanges
    }

    const smoothed: SceneChangeResult[] = []

    for (let i = 0; i < sceneChanges.length; i++) {
      const windowStart = Math.max(0, i - Math.floor(this.config.smoothingWindow / 2))
      const windowEnd = Math.min(sceneChanges.length, i + Math.floor(this.config.smoothingWindow / 2) + 1)

      const window = sceneChanges.slice(windowStart, windowEnd)

      // Calculate weighted average
      const weights = window.map((_, idx) => {
        const distance = Math.abs(idx - Math.floor(this.config.smoothingWindow / 2))
        return Math.exp(-distance * distance / (2 * this.config.smoothingWindow))
      })

      const totalWeight = weights.reduce((sum, w) => sum + w, 0)

      const smoothedTime = window.reduce((sum, change, idx) =>
        sum + change.time * weights[idx], 0) / totalWeight

      const smoothedChange: SceneChangeResult = {
        ...sceneChanges[i],
        time: smoothedTime,
        metadata: {
          ...sceneChanges[i].metadata,
          processingTime: sceneChanges[i].metadata.processingTime + 10 // Add smoothing time
        }
      }

      smoothed.push(smoothedChange)
    }

    return smoothed
  }

  /**
   * Cluster nearby scene changes
   */
  private clusterSceneChanges(sceneChanges: SceneChangeResult[]): SceneChangeResult[] {
    if (sceneChanges.length < 2) return sceneChanges

    const clusters: SceneChangeResult[] = []
    let currentCluster: SceneChangeResult[] = [sceneChanges[0]]

    for (let i = 1; i < sceneChanges.length; i++) {
      const current = sceneChanges[i]
      const lastInCluster = currentCluster[currentCluster.length - 1]

      if ((current.time - lastInCluster.time) <= this.config.maxSceneGap) {
        // Add to current cluster
        currentCluster.push(current)
      } else {
        // Process current cluster and start new one
        clusters.push(this.mergeCluster(currentCluster))
        currentCluster = [current]
      }
    }

    // Process final cluster
    if (currentCluster.length > 0) {
      clusters.push(this.mergeCluster(currentCluster))
    }

    return clusters
  }

  /**
   * Merge a cluster of scene changes into a single representative change
   */
  private mergeCluster(cluster: SceneChangeResult[]): SceneChangeResult {
    if (cluster.length === 1) return cluster[0]

    // Weighted average by change percentage
    const totalWeight = cluster.reduce((sum, change) => sum + change.changePercentage, 0)

    const mergedTime = cluster.reduce((sum, change) =>
      sum + change.time * (change.changePercentage / totalWeight), 0)

    const mergedPercentage = cluster.reduce((sum, change) =>
      sum + change.changePercentage, 0) / cluster.length

    // Use the change with highest confidence as base
    const baseChange = cluster.reduce((best, current) =>
      current.metadata.thresholdUsed > best.metadata.thresholdUsed ? current : best
    )

    return {
      ...baseChange,
      time: mergedTime,
      changePercentage: mergedPercentage,
      metadata: {
        ...baseChange.metadata,
        processingTime: baseChange.metadata.processingTime + cluster.length * 5 // Add clustering time
      }
    }
  }

  /**
   * Generate scene segments from scene changes
   */
  private generateSegments(sceneChanges: SceneChangeResult[], videoDuration: number): SceneSegment[] {
    const segments: SceneSegment[] = []

    // Add initial segment (0 to first scene change)
    if (sceneChanges.length > 0) {
      segments.push(this.createSegment(0, sceneChanges[0].time, undefined, sceneChanges[0]))
    }

    // Add segments between scene changes
    for (let i = 0; i < sceneChanges.length - 1; i++) {
      segments.push(this.createSegment(
        sceneChanges[i].time,
        sceneChanges[i + 1].time,
        sceneChanges[i],
        sceneChanges[i + 1]
      ))
    }

    // Add final segment (last scene change to end)
    if (sceneChanges.length > 0) {
      const lastChange = sceneChanges[sceneChanges.length - 1]
      segments.push(this.createSegment(lastChange.time, videoDuration, lastChange, undefined))
    }

    // If no scene changes, create single segment for entire video
    if (segments.length === 0) {
      segments.push(this.createSegment(0, videoDuration, undefined, undefined))
    }

    return segments
  }

  /**
   * Create a scene segment
   */
  private createSegment(
    startTime: number,
    endTime: number,
    startChange?: SceneChangeResult,
    endChange?: SceneChangeResult
  ): SceneSegment {
    const duration = endTime - startTime

    // Estimate motion characteristics
    const motionMagnitude = startChange?.motionVectors?.magnitude ||
                           endChange?.motionVectors?.magnitude || 0
    const motionDirection = startChange?.motionVectors?.dominantDirection ||
                           endChange?.motionVectors?.dominantDirection || 0
    const isCameraMovement = startChange?.motionVectors?.isCameraMovement ||
                            endChange?.motionVectors?.isCameraMovement || false

    // Calculate stability (inverse of motion magnitude)
    const stability = Math.max(0, 1 - motionMagnitude / 100)

    return {
      id: `segment_${startTime}_${endTime}_${Math.random().toString(36).substr(2, 9)}`,
      startTime,
      endTime,
      duration,
      startSceneChange: startChange,
      endSceneChange: endChange,
      type: 'static', // Will be classified later
      motion: {
        averageMagnitude: motionMagnitude,
        direction: motionDirection,
        isCameraMovement,
        stability
      },
      confidence: (startChange?.metadata.thresholdUsed || 0.5) *
                 (endChange?.metadata.thresholdUsed || 0.5),
      metadata: {
        frameCount: Math.floor(duration * 30), // Assume 30fps
        processingTime: (startChange?.metadata.processingTime || 0) +
                       (endChange?.metadata.processingTime || 0),
        source: 'detection'
      }
    }
  }

  /**
   * Classify segments based on their characteristics
   */
  private classifySegments(segments: SceneSegment[]): SceneSegment[] {
    return segments.map(segment => {
      let type: SceneSegment['type'] = 'static'

      // Classify based on motion and duration
      if (segment.motion.averageMagnitude > 50) {
        type = 'dynamic'
      } else if (segment.startSceneChange || segment.endSceneChange) {
        type = 'transition'
      }

      // Adjust confidence based on classification
      let confidence = segment.confidence
      if (type === 'dynamic') confidence *= 0.9
      if (type === 'transition') confidence *= 1.1

      return {
        ...segment,
        type,
        confidence: Math.min(1, confidence)
      }
    })
  }

  /**
   * Calculate timeline statistics
   */
  private calculateTimelineStats(segments: SceneSegment[], videoDuration: number): SceneTimeline['stats'] {
    const totalSegments = segments.length
    const averageSegmentDuration = segments.reduce((sum, seg) => sum + seg.duration, 0) / totalSegments
    const sceneChangeFrequency = (segments.filter(seg => seg.startSceneChange).length / videoDuration) * 60

    const motionVariability = segments.length > 1
      ? this.calculateMotionVariability(segments)
      : 0

    const temporalCoverage = segments.reduce((sum, seg) => sum + seg.duration, 0) / videoDuration

    return {
      totalSegments,
      averageSegmentDuration,
      sceneChangeFrequency,
      motionVariability,
      temporalCoverage
    }
  }

  /**
   * Calculate motion variability across segments
   */
  private calculateMotionVariability(segments: SceneSegment[]): number {
    const magnitudes = segments.map(seg => seg.motion.averageMagnitude)
    const mean = magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length
    const variance = magnitudes.reduce((sum, mag) => sum + (mag - mean) ** 2, 0) / magnitudes.length

    return Math.sqrt(variance) / (mean || 1) // Coefficient of variation
  }

  /**
   * Generate transitions between segments
   */
  generateTransitions(timeline: SceneTimeline): SceneTransition[] {
    const transitions: SceneTransition[] = []

    for (let i = 0; i < timeline.segments.length - 1; i++) {
      const fromSegment = timeline.segments[i]
      const toSegment = timeline.segments[i + 1]

      if (fromSegment.endSceneChange) {
        const transition = this.createTransition(
          fromSegment.endSceneChange,
          fromSegment,
          toSegment
        )
        transitions.push(transition)
      }
    }

    return transitions
  }

  /**
   * Create a transition object
   */
  private createTransition(
    sceneChange: SceneChangeResult,
    fromSegment?: SceneSegment,
    toSegment?: SceneSegment
  ): SceneTransition {
    // Determine transition type based on scene change characteristics
    let type: SceneTransition['type'] = 'cut'
    let duration = 0

    if (sceneChange.changePercentage > 0.7) {
      type = 'cut'
      duration = 0.1 // Very quick cut
    } else if (sceneChange.changePercentage > 0.4) {
      type = 'fade'
      duration = 0.5 // Fade transition
    } else {
      type = 'dissolve'
      duration = 1.0 // Dissolve transition
    }

    const motionDirection = sceneChange.motionVectors?.dominantDirection || 0
    const intensity = sceneChange.changePercentage
    const complexity = (sceneChange.metadata.processingTime || 0) / 100

    return {
      id: `transition_${sceneChange.id}`,
      time: sceneChange.time,
      type,
      duration,
      confidence: sceneChange.metadata.thresholdUsed,
      fromSegment,
      toSegment,
      metadata: {
        motionDirection,
        intensity,
        complexity
      }
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SceneTimelineConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  getConfig(): SceneTimelineConfig {
    return this.config
  }
}

/**
 * Default scene timeline configuration
 */
export const DEFAULT_SCENE_TIMELINE_CONFIG: SceneTimelineConfig = {
  minSceneGap: 1.0, // 1 second minimum between scene changes
  maxSceneGap: 3.0, // 3 seconds max gap for clustering
  smoothingWindow: 3,
  mergeThreshold: 0.3,
  delayCompensation: {
    processingDelayMs: 200,
    frameRate: 30,
    predictionBufferSize: 10,
    predictionThreshold: 0.6,
    maxCompensationFrames: 15,
    smoothingFactor: 0.3
  },
  enableClustering: true,
  minConfidence: 0.5
}

/**
 * Create scene timeline generator with default config
 */
export function createSceneTimelineGenerator(
  config?: Partial<SceneTimelineConfig>
): SceneTimelineGenerator {
  return new SceneTimelineGenerator({
    ...DEFAULT_SCENE_TIMELINE_CONFIG,
    ...config
  })
}

/**
 * Quick timeline generation for simple use cases
 */
export function generateSceneTimeline(
  sceneChanges: SceneChangeResult[],
  videoDuration: number,
  config?: Partial<SceneTimelineConfig>
): SceneTimeline {
  const generator = createSceneTimelineGenerator(config)
  return generator.generateTimeline(sceneChanges, videoDuration)
}
