import type { SceneChangeResult } from '../types'

/**
 * Delay Compensation Algorithm
 *
 * Compensates for processing delays in real-time video cropping systems.
 * Ensures that crop positions are applied at the correct time during playback
 * by predicting ahead and adjusting for algorithmic latency.
 */

export interface DelayCompensationConfig {
  /** Expected processing delay in milliseconds */
  processingDelayMs: number
  /** Frame rate of the video */
  frameRate: number
  /** Buffer size for prediction (frames) */
  predictionBufferSize: number
  /** Confidence threshold for predictions */
  predictionThreshold: number
  /** Maximum compensation frames */
  maxCompensationFrames: number
  /** Smoothing factor for predictions (0-1) */
  smoothingFactor: number
}

export interface DelayCompensationResult {
  /** Compensated time offset in seconds */
  compensatedTime: number
  /** Confidence score (0-1) */
  confidence: number
  /** Whether compensation was applied */
  compensationApplied: boolean
  /** Original detection time */
  originalTime: number
  /** Compensation amount in frames */
  compensationFrames: number
  /** Prediction metadata */
  metadata: {
    processingDelay: number
    predictionAccuracy: number
    bufferUtilization: number
  }
}

export interface SceneChangePrediction {
  /** Predicted scene change time */
  predictedTime: number
  /** Prediction confidence (0-1) */
  confidence: number
  /** Prediction method used */
  method: 'linear' | 'exponential' | 'pattern' | 'neural'
  /** Supporting data points */
  supportingPoints: number
  /** Prediction error margin */
  errorMargin: number
}

/**
 * Delay Compensation Calculator
 */
export class DelayCompensationCalculator {
  private config: DelayCompensationConfig
  private sceneChangeHistory: SceneChangeResult[] = []
  private predictionBuffer: SceneChangePrediction[] = []

  constructor(config: DelayCompensationConfig) {
    this.config = config
  }

  /**
   * Compensate for delay in scene change detection
   */
  compensateSceneChange(sceneChange: SceneChangeResult): DelayCompensationResult {
    const originalTime = sceneChange.time

    // Add to history for pattern analysis
    this.sceneChangeHistory.push(sceneChange)
    this.maintainHistorySize()

    // Predict future scene changes
    const prediction = this.predictNextSceneChange()

    // Calculate compensation
    let compensatedTime = originalTime
    let compensationFrames = 0
    let confidence = sceneChange.metadata.thresholdUsed

    if (prediction && prediction.confidence > this.config.predictionThreshold) {
      // Apply predictive compensation
      const delayFrames = Math.ceil((this.config.processingDelayMs / 1000) * this.config.frameRate)
      const predictionOffset = prediction.predictedTime - originalTime

      // Apply compensation if prediction is within reasonable bounds
      if (Math.abs(predictionOffset) < 2.0) { // Within 2 seconds
        compensatedTime = originalTime - (delayFrames / this.config.frameRate)
        compensationFrames = delayFrames
        confidence = Math.min(1.0, confidence * prediction.confidence)
      }
    } else {
      // Apply fixed delay compensation
      compensationFrames = Math.min(
        Math.ceil((this.config.processingDelayMs / 1000) * this.config.frameRate),
        this.config.maxCompensationFrames
      )
      compensatedTime = originalTime - (compensationFrames / this.config.frameRate)
    }

    return {
      compensatedTime: Math.max(0, compensatedTime), // Ensure non-negative
      confidence,
      compensationApplied: compensationFrames > 0,
      originalTime,
      compensationFrames,
      metadata: {
        processingDelay: this.config.processingDelayMs,
        predictionAccuracy: prediction?.confidence || 0,
        bufferUtilization: this.predictionBuffer.length / this.config.predictionBufferSize
      }
    }
  }

  /**
   * Predict the next scene change based on historical patterns
   */
  private predictNextSceneChange(): SceneChangePrediction | null {
    if (this.sceneChangeHistory.length < 3) {
      return null // Need minimum history for prediction
    }

    const recentChanges = this.sceneChangeHistory.slice(-5)
    const intervals = this.calculateIntervals(recentChanges)

    if (intervals.length < 2) {
      return null
    }

    // Try different prediction methods
    const linearPrediction = this.predictLinear(intervals)
    const exponentialPrediction = this.predictExponential(intervals)
    const patternPrediction = this.predictPattern(recentChanges)

    // Choose the best prediction
    const predictions = [linearPrediction, exponentialPrediction, patternPrediction]
      .filter(p => p !== null)
      .sort((a, b) => b!.confidence - a!.confidence)

    if (predictions.length === 0) return null

    const bestPrediction = predictions[0]!
    const lastSceneChange = recentChanges[recentChanges.length - 1]
    const predictedTime = lastSceneChange.time + bestPrediction.predictedTime

    // Add to prediction buffer
    this.predictionBuffer.push({
      predictedTime,
      confidence: bestPrediction.confidence,
      method: bestPrediction.method,
      supportingPoints: recentChanges.length,
      errorMargin: bestPrediction.errorMargin
    })

    this.maintainPredictionBuffer()

    return {
      predictedTime,
      confidence: bestPrediction.confidence,
      method: bestPrediction.method,
      supportingPoints: recentChanges.length,
      errorMargin: bestPrediction.errorMargin
    }
  }

  /**
   * Calculate time intervals between scene changes
   */
  private calculateIntervals(changes: SceneChangeResult[]): number[] {
    const intervals: number[] = []
    for (let i = 1; i < changes.length; i++) {
      intervals.push(changes[i].time - changes[i - 1].time)
    }
    return intervals
  }

  /**
   * Linear prediction based on average interval
   */
  private predictLinear(intervals: number[]): SceneChangePrediction | null {
    if (intervals.length < 2) return null

    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    const variance = this.calculateVariance(intervals, averageInterval)
    const confidence = Math.max(0.1, 1 - (variance / averageInterval)) // Higher variance = lower confidence

    return {
      predictedTime: averageInterval,
      confidence,
      method: 'linear',
      supportingPoints: intervals.length,
      errorMargin: Math.sqrt(variance)
    }
  }

  /**
   * Exponential prediction for accelerating/decelerating patterns
   */
  private predictExponential(intervals: number[]): SceneChangePrediction | null {
    if (intervals.length < 3) return null

    // Fit exponential curve: interval = a * e^(b * index)
    const n = intervals.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = intervals.map(interval => Math.log(Math.max(0.001, interval)))

    // Simple linear regression on log scale
    const { slope, intercept, rSquared } = this.linearRegression(x, y)

    if (rSquared < 0.5) return null // Poor fit

    const nextInterval = Math.exp(intercept + slope * n)
    const confidence = Math.min(1.0, rSquared)

    return {
      predictedTime: nextInterval,
      confidence,
      method: 'exponential',
      supportingPoints: intervals.length,
      errorMargin: nextInterval * (1 - rSquared)
    }
  }

  /**
   * Pattern-based prediction for repeating sequences
   */
  private predictPattern(changes: SceneChangeResult[]): SceneChangePrediction | null {
    if (changes.length < 6) return null // Need more data for pattern recognition

    const intervals = this.calculateIntervals(changes)
    const patterns = this.findPatterns(intervals)

    if (patterns.length === 0) return null

    // Use the most frequent pattern
    const bestPattern = patterns[0]
    const predictedInterval = bestPattern.averageInterval
    const confidence = Math.min(1.0, bestPattern.frequency / intervals.length)

    return {
      predictedTime: predictedInterval,
      confidence,
      method: 'pattern',
      supportingPoints: bestPattern.frequency,
      errorMargin: bestPattern.variance
    }
  }

  /**
   * Find repeating patterns in interval data
   */
  private findPatterns(intervals: number[]): Array<{
    averageInterval: number
    frequency: number
    variance: number
  }> {
    const patterns: Map<string, { intervals: number[], count: number }> = new Map()

    // Look for patterns of length 2-4
    for (let length = 2; length <= 4; length++) {
      for (let i = 0; i <= intervals.length - length; i++) {
        const pattern = intervals.slice(i, i + length)
        const key = pattern.join(',')

        if (!patterns.has(key)) {
          patterns.set(key, { intervals: [], count: 0 })
        }

        const entry = patterns.get(key)!
        entry.intervals.push(...pattern)
        entry.count++
      }
    }

    // Convert to results
    return Array.from(patterns.entries())
      .filter(([_, entry]) => entry.count >= 2) // Must appear at least twice
      .map(([key, entry]) => {
        const averageInterval = entry.intervals.reduce((sum, val) => sum + val, 0) / entry.intervals.length
        const variance = this.calculateVariance(entry.intervals, averageInterval)

        return {
          averageInterval,
          frequency: entry.count,
          variance
        }
      })
      .sort((a, b) => b.frequency - a.frequency) // Sort by frequency
  }

  /**
   * Simple linear regression
   */
  private linearRegression(x: number[], y: number[]): {
    slope: number
    intercept: number
    rSquared: number
  } {
    const n = x.length
    const sumX = x.reduce((sum, val) => sum + val, 0)
    const sumY = y.reduce((sum, val) => sum + val, 0)
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
    const sumXX = x.reduce((sum, val) => sum + val * val, 0)
    const sumYY = y.reduce((sum, val) => sum + val * val, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Calculate R-squared
    const yMean = sumY / n
    const ssRes = y.reduce((sum, val, i) => {
      const predicted = slope * x[i] + intercept
      return sum + (val - predicted) ** 2
    }, 0)
    const ssTot = y.reduce((sum, val) => sum + (val - yMean) ** 2, 0)
    const rSquared = 1 - (ssRes / ssTot)

    return { slope, intercept, rSquared: isNaN(rSquared) ? 0 : rSquared }
  }

  /**
   * Calculate variance of an array
   */
  private calculateVariance(values: number[], mean: number): number {
    if (values.length <= 1) return 0

    const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / (values.length - 1)
    return variance
  }

  /**
   * Maintain history size limit
   */
  private maintainHistorySize(): void {
    const maxHistorySize = 100 // Keep last 100 scene changes
    if (this.sceneChangeHistory.length > maxHistorySize) {
      this.sceneChangeHistory = this.sceneChangeHistory.slice(-maxHistorySize)
    }
  }

  /**
   * Maintain prediction buffer size
   */
  private maintainPredictionBuffer(): void {
    if (this.predictionBuffer.length > this.config.predictionBufferSize) {
      this.predictionBuffer = this.predictionBuffer.slice(-this.config.predictionBufferSize)
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<DelayCompensationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Reset internal state
   */
  reset(): void {
    this.sceneChangeHistory = []
    this.predictionBuffer = []
  }

  /**
   * Get current statistics
   */
  getStats(): {
    historySize: number
    predictionBufferSize: number
    averageCompensation: number
    predictionAccuracy: number
  } {
    const averageCompensation = this.sceneChangeHistory.length > 0
      ? this.sceneChangeHistory.reduce((sum, change) =>
          sum + (change.metadata.processingTime || 0), 0) / this.sceneChangeHistory.length
      : 0

    const predictionAccuracy = this.predictionBuffer.length > 0
      ? this.predictionBuffer.reduce((sum, pred) => sum + pred.confidence, 0) / this.predictionBuffer.length
      : 0

    return {
      historySize: this.sceneChangeHistory.length,
      predictionBufferSize: this.predictionBuffer.length,
      averageCompensation,
      predictionAccuracy
    }
  }
}

/**
 * Default delay compensation configuration
 */
export const DEFAULT_DELAY_COMPENSATION_CONFIG: DelayCompensationConfig = {
  processingDelayMs: 200, // 200ms typical processing delay
  frameRate: 30,
  predictionBufferSize: 10,
  predictionThreshold: 0.6,
  maxCompensationFrames: 15,
  smoothingFactor: 0.3
}

/**
 * Create delay compensation calculator with default config
 */
export function createDelayCompensationCalculator(
  config?: Partial<DelayCompensationConfig>
): DelayCompensationCalculator {
  return new DelayCompensationCalculator({
    ...DEFAULT_DELAY_COMPENSATION_CONFIG,
    ...config
  })
}

/**
 * Apply delay compensation to a batch of scene changes
 */
export function compensateSceneChanges(
  sceneChanges: SceneChangeResult[],
  config?: Partial<DelayCompensationConfig>
): DelayCompensationResult[] {
  const calculator = createDelayCompensationCalculator(config)

  return sceneChanges.map(sceneChange =>
    calculator.compensateSceneChange(sceneChange)
  )
}
