/**
 * Adaptive detector cadence scheduler
 * Adjusts face detection frequency based on tracking innovation and scene cuts
 */

import type { TrackingInnovation } from './track'
import type { ShotBoundary } from '../../types/scene-detection'
import type { GlobalMotionEstimate } from './track'

export interface CadenceDecision {
  /** Recommended cadence (frames between detections) */
  cadence: number
  /** Reason for cadence change */
  reason: 'stable_tracking' | 'unstable_tracking' | 'near_cut' | 'high_motion' | 'reset'
  /** Confidence in this decision (0-1) */
  confidence: number
  /** Expected performance impact */
  expectedEfficiency: number
}

export interface SchedulerState {
  /** Current cadence */
  currentCadence: number
  /** Recent cadence decisions */
  decisionHistory: CadenceDecision[]
  /** Frames since last cadence change */
  framesSinceChange: number
  /** Current stability score */
  stabilityScore: number
}

export interface SchedulerConfig {
  /** Base cadence when tracking is stable */
  baseCadence: number
  /** Maximum cadence for very stable tracking */
  maxCadence: number
  /** Minimum cadence for unstable tracking or cuts */
  minCadence: number
  /** Innovation threshold for stable tracking (lower = more stable) */
  stableInnovationThreshold: number
  /** Innovation threshold for unstable tracking (higher = less stable) */
  unstableInnovationThreshold: number
  /** Global motion threshold for reducing cadence */
  highMotionThreshold: number
  /** Distance to shot boundary for increased detection frequency */
  cutProximityFrames: number
  /** Minimum frames between cadence changes */
  minChangeInterval: number
  /** Decision history size */
  historySize: number
  /** Stability window size for averaging */
  stabilityWindow: number
}

export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  baseCadence: 3,
  maxCadence: 9,
  minCadence: 2,
  stableInnovationThreshold: 0.1,
  unstableInnovationThreshold: 0.4,
  highMotionThreshold: 10, // pixels/frame
  cutProximityFrames: 12, // ~0.5s at 24fps
  minChangeInterval: 15, // Don't change too frequently
  historySize: 10,
  stabilityWindow: 5
}

/**
 * Adaptive cadence scheduler
 * Controls detector frequency based on tracking stability and scene dynamics
 */
export class AdaptiveCadenceScheduler {
  private config: SchedulerConfig
  private state: SchedulerState
  private recentInnovations: TrackingInnovation[] = []
  private recentMotions: GlobalMotionEstimate[] = []

  constructor(config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG) {
    this.config = config
    this.state = {
      currentCadence: config.baseCadence,
      decisionHistory: [],
      framesSinceChange: 0,
      stabilityScore: 0.5
    }
  }

  /**
   * Main cadence control function
   * Returns recommended cadence based on current conditions
   */
  getNextCadence(
    frameIndex: number,
    innovation?: TrackingInnovation,
    globalMotion?: GlobalMotionEstimate,
    nearbyCuts?: ShotBoundary[]
  ): CadenceDecision {
    this.state.framesSinceChange++

    // Update recent data
    if (innovation) {
      this.recentInnovations.push(innovation)
      if (this.recentInnovations.length > this.config.stabilityWindow) {
        this.recentInnovations.shift()
      }
    }

    if (globalMotion) {
      this.recentMotions.push(globalMotion)
      if (this.recentMotions.length > this.config.stabilityWindow) {
        this.recentMotions.shift()
      }
    }

    // Calculate current stability
    const stability = this.calculateStability()
    this.state.stabilityScore = stability

    // Check for nearby cuts
    const nearCut = this.isNearCut(frameIndex, nearbyCuts)

    // Check for high global motion
    const highMotion = this.hasHighMotion()

    // Determine cadence based on conditions
    let decision: CadenceDecision

    if (nearCut) {
      // Near a cut - increase detection frequency
      decision = {
        cadence: this.config.minCadence,
        reason: 'near_cut',
        confidence: 0.9,
        expectedEfficiency: this.calculateEfficiency(this.config.minCadence)
      }
    } else if (highMotion) {
      // High global motion - increase detection frequency
      decision = {
        cadence: Math.min(this.config.baseCadence, this.state.currentCadence),
        reason: 'high_motion',
        confidence: 0.8,
        expectedEfficiency: this.calculateEfficiency(Math.min(this.config.baseCadence, this.state.currentCadence))
      }
    } else if (stability < this.config.stableInnovationThreshold) {
      // Very stable tracking - can reduce detection frequency
      const targetCadence = Math.min(this.config.maxCadence, this.state.currentCadence + 1)
      decision = {
        cadence: targetCadence,
        reason: 'stable_tracking',
        confidence: Math.min(0.9, stability * 2),
        expectedEfficiency: this.calculateEfficiency(targetCadence)
      }
    } else if (stability > this.config.unstableInnovationThreshold) {
      // Unstable tracking - increase detection frequency
      const targetCadence = Math.max(this.config.minCadence, this.state.currentCadence - 1)
      decision = {
        cadence: targetCadence,
        reason: 'unstable_tracking',
        confidence: Math.min(0.9, (1 - stability) * 2),
        expectedEfficiency: this.calculateEfficiency(targetCadence)
      }
    } else {
      // Maintain current cadence
      decision = {
        cadence: this.state.currentCadence,
        reason: 'stable_tracking',
        confidence: 0.7,
        expectedEfficiency: this.calculateEfficiency(this.state.currentCadence)
      }
    }

    // Apply minimum change interval constraint
    if (this.state.framesSinceChange < this.config.minChangeInterval &&
        Math.abs(decision.cadence - this.state.currentCadence) > 0) {
      // Keep current cadence if change interval not met
      decision = {
        cadence: this.state.currentCadence,
        reason: decision.reason,
        confidence: decision.confidence * 0.8, // Reduce confidence due to constraint
        expectedEfficiency: this.calculateEfficiency(this.state.currentCadence)
      }
    }

    // Update state if cadence changed
    if (decision.cadence !== this.state.currentCadence) {
      this.state.currentCadence = decision.cadence
      this.state.framesSinceChange = 0
    }

    // Record decision
    this.state.decisionHistory.push(decision)
    if (this.state.decisionHistory.length > this.config.historySize) {
      this.state.decisionHistory.shift()
    }

    return decision
  }

  /**
   * Get current scheduler state
   */
  getState(): SchedulerState {
    return { ...this.state }
  }

  /**
   * Reset scheduler to initial state
   */
  reset(): void {
    this.state = {
      currentCadence: this.config.baseCadence,
      decisionHistory: [],
      framesSinceChange: 0,
      stabilityScore: 0.5
    }
    this.recentInnovations = []
    this.recentMotions = []
  }

  /**
   * Calculate current tracking stability score
   */
  private calculateStability(): number {
    if (this.recentInnovations.length === 0) {
      return 0.5 // Neutral stability when no data
    }

    // Average innovation score over recent frames
    const avgInnovation = this.recentInnovations.reduce((sum, inn) => sum + inn.score, 0) / this.recentInnovations.length

    // Lower innovation = higher stability
    return Math.max(0, Math.min(1, 1 - avgInnovation))
  }

  /**
   * Check if current frame is near a shot boundary
   */
  private isNearCut(frameIndex: number, nearbyCuts?: ShotBoundary[]): boolean {
    if (!nearbyCuts || nearbyCuts.length === 0) {
      return false
    }

    // Check if any cut is within proximity threshold
    return nearbyCuts.some(cut => Math.abs(frameIndex - cut.startFrame) <= this.config.cutProximityFrames)
  }

  /**
   * Check if there's high global motion
   */
  private hasHighMotion(): boolean {
    if (this.recentMotions.length === 0) {
      return false
    }

    // Check if recent motion exceeds threshold
    const avgMotion = this.recentMotions.reduce((sum, motion) => sum + motion.magnitude, 0) / this.recentMotions.length
    return avgMotion > this.config.highMotionThreshold
  }

  /**
   * Calculate expected efficiency for a given cadence
   * Efficiency = 1 / cadence (higher cadence = lower efficiency)
   */
  private calculateEfficiency(cadence: number): number {
    return this.config.baseCadence / cadence
  }

  /**
   * Get scheduler statistics
   */
  getStats(): {
    averageCadence: number
    cadenceVariance: number
    stabilityTrend: number
    decisionDistribution: Record<string, number>
  } {
    const decisions = this.state.decisionHistory
    if (decisions.length === 0) {
      return {
        averageCadence: this.config.baseCadence,
        cadenceVariance: 0,
        stabilityTrend: 0,
        decisionDistribution: {}
      }
    }

    // Average cadence
    const avgCadence = decisions.reduce((sum, d) => sum + d.cadence, 0) / decisions.length

    // Cadence variance
    const variance = decisions.reduce((sum, d) => sum + Math.pow(d.cadence - avgCadence, 2), 0) / decisions.length

    // Stability trend (positive = becoming more stable)
    const recentStability = decisions.slice(-5).map(d => d.expectedEfficiency)
    const stabilityTrend = recentStability.length > 1 ?
      recentStability[recentStability.length - 1] - recentStability[0] : 0

    // Decision distribution
    const distribution: Record<string, number> = {}
    decisions.forEach(d => {
      distribution[d.reason] = (distribution[d.reason] || 0) + 1
    })

    return {
      averageCadence: avgCadence,
      cadenceVariance: variance,
      stabilityTrend,
      decisionDistribution: distribution
    }
  }
}

/**
 * Utility function for cadence control (convenience wrapper)
 */
export function cadenceController(
  prevInnovation?: TrackingInnovation,
  globalMotion?: GlobalMotionEstimate,
  nearCut = false,
  currentCadence = DEFAULT_SCHEDULER_CONFIG.baseCadence
): number {
  // Simple rule-based cadence control for basic usage
  let nextCadence = currentCadence

  if (nearCut) {
    // Near cut - high frequency detection
    nextCadence = Math.max(2, currentCadence - 1)
  } else if (globalMotion && globalMotion.magnitude > DEFAULT_SCHEDULER_CONFIG.highMotionThreshold) {
    // High motion - moderate frequency detection
    nextCadence = Math.max(3, currentCadence)
  } else if (prevInnovation) {
    if (prevInnovation.score < DEFAULT_SCHEDULER_CONFIG.stableInnovationThreshold) {
      // Stable tracking - can reduce frequency
      nextCadence = Math.min(9, currentCadence + 1)
    } else if (prevInnovation.score > DEFAULT_SCHEDULER_CONFIG.unstableInnovationThreshold) {
      // Unstable tracking - increase frequency
      nextCadence = Math.max(2, currentCadence - 1)
    }
  }

  return nextCadence
}
