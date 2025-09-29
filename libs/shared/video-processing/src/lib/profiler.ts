/**
 * Performance profiling harness for auto-crop pipeline
 */
import type {
  PerformanceProfiler,
  PerformanceMeasurement,
  ProfilingSession,
  ProfilingConfig,
  StageMetrics,
  PerformanceReport
} from '../types/profiling'
import { DEFAULT_PROFILING_CONFIG } from '../types/profiling'

/**
 * Web-compatible performance.now() polyfill
 */
const getPerformanceNow = (): number => {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now()
  }
  return Date.now()
}

/**
 * Memory usage measurement (where available)
 */
const getMemoryUsage = (): number | undefined => {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    return (performance as any).memory.usedJSHeapSize
  }
  return undefined
}

/**
 * Hardware/software environment detection
 */
const detectEnvironment = () => ({
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  hardwareConcurrency: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 1 : 1,
  deviceMemory: typeof navigator !== 'undefined' ? (navigator as any).deviceMemory : undefined,
  webGLSupported: (() => {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch {
      return false
    }
  })(),
  wasmSupported: typeof WebAssembly !== 'undefined',
  wasmSimdSupported: (() => {
    try {
      // Check if SIMD is supported by trying to instantiate a module with SIMD
      return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 9, 1, 7, 0, 65, 0, 253, 15, 26, 11]))
    } catch {
      return false
    }
  })(),
  wasmThreadsSupported: (() => {
    try {
      // Check if threads are supported by trying to instantiate a module with shared memory
      return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 0, 0, 0, 10, 9, 1, 7, 0, 65, 0, 253, 15, 26, 11]))
    } catch {
      return false
    }
  })(),
  crossOriginIsolated: typeof navigator !== 'undefined' ? navigator.crossOriginIsolated || false : false
})

/**
 * Performance profiler implementation
 */
export class VideoProcessingProfiler implements PerformanceProfiler {
  private sessions: Map<string, ProfilingSession> = new Map()
  private measurements: Map<string, PerformanceMeasurement> = new Map()
  private currentSession: ProfilingSession | null = null
  private config: ProfilingConfig

  constructor(config: Partial<ProfilingConfig> = {}) {
    this.config = { ...DEFAULT_PROFILING_CONFIG, ...config }
  }

  /**
   * Start a new profiling session
   */
  startSession(videoId: string, metadata: Record<string, any> = {}): string {
    if (!this.config.enabled) return ''

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const session: ProfilingSession = {
      id: sessionId,
      videoId,
      startTime: getPerformanceNow(),
      measurements: [],
      metadata: {
        video: metadata.video || {},
        parameters: metadata.parameters || {},
        flags: metadata.flags || {
          perf_webcodecs_decode: false,
          perf_gpu_delegate: false,
          perf_videoencoder: false
        },
        environment: detectEnvironment()
      }
    }

    this.sessions.set(sessionId, session)
    this.currentSession = session

    return sessionId
  }

  /**
   * End a profiling session
   */
  endSession(sessionId: string): ProfilingSession | null {
    if (!this.config.enabled) return null

    const session = this.sessions.get(sessionId)
    if (!session) return null

    session.endTime = getPerformanceNow()
    this.currentSession = null

    // Clean up old sessions if we exceed maxSessions
    if (this.sessions.size > this.config.maxSessions) {
      const sessionsToDelete = Array.from(this.sessions.keys())
        .sort((a, b) => {
          const sessionA = this.sessions.get(a)!
          const sessionB = this.sessions.get(b)!
          return (sessionA.endTime || 0) - (sessionB.endTime || 0)
        })
        .slice(0, this.sessions.size - this.config.maxSessions)

      sessionsToDelete.forEach(id => this.sessions.delete(id))
    }

    return session
  }

  /**
   * Start measuring an operation
   */
  startMeasurement(name: string, metadata: Record<string, any> = {}): string {
    if (!this.config.enabled || Math.random() > this.config.samplingRate) return ''

    const measurementId = `measurement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const measurement: PerformanceMeasurement = {
      name,
      startTime: getPerformanceNow(),
      endTime: 0,
      duration: 0,
      startMemory: this.config.memoryProfiling ? getMemoryUsage() : undefined,
      metadata
    }

    this.measurements.set(measurementId, measurement)

    // Add to current session if exists
    if (this.currentSession) {
      this.currentSession.measurements.push(measurement)
    }

    return measurementId
  }

  /**
   * End measuring an operation
   */
  endMeasurement(measurementId: string): PerformanceMeasurement | null {
    if (!this.config.enabled || !measurementId) return null

    const measurement = this.measurements.get(measurementId)
    if (!measurement) return null

    measurement.endTime = getPerformanceNow()
    measurement.duration = measurement.endTime - measurement.startTime

    if (this.config.memoryProfiling) {
      measurement.endMemory = getMemoryUsage()
      if (measurement.startMemory !== undefined && measurement.endMemory !== undefined) {
        measurement.memoryDelta = measurement.endMemory - measurement.startMemory
      }
    }

    this.measurements.delete(measurementId)

    return measurement
  }

  /**
   * Get current active session
   */
  getCurrentSession(): ProfilingSession | null {
    return this.currentSession
  }

  /**
   * Get all completed sessions
   */
  getSessions(): ProfilingSession[] {
    return Array.from(this.sessions.values()).filter(session => session.endTime !== undefined)
  }

  /**
   * Export profiling data
   */
  exportData(format: ProfilingConfig['exportFormat'] = 'json'): string {
    const sessions = this.getSessions()

    switch (format) {
      case 'json':
        return JSON.stringify(sessions, null, 2)

      case 'csv':
        if (sessions.length === 0) return ''

        const headers = [
          'sessionId', 'videoId', 'startTime', 'endTime', 'duration',
          'measurements', 'videoDuration', 'videoWidth', 'videoHeight'
        ]

        const rows = sessions.map(session => [
          session.id,
          session.videoId,
          session.startTime.toString(),
          (session.endTime || 0).toString(),
          ((session.endTime || 0) - session.startTime).toString(),
          session.measurements.length.toString(),
          session.metadata.video.duration?.toString() || '',
          session.metadata.video.width?.toString() || '',
          session.metadata.video.height?.toString() || ''
        ])

        return [headers, ...rows].map(row => row.join(',')).join('\n')

      case 'console':
        console.table(sessions.map(session => ({
          id: session.id,
          videoId: session.videoId,
          duration: `${((session.endTime || 0) - session.startTime).toFixed(2)}ms`,
          measurements: session.measurements.length,
          video: `${session.metadata.video.width || 0}x${session.metadata.video.height || 0}`
        })))
        return 'Data logged to console'

      default:
        return JSON.stringify(sessions, null, 2)
    }
  }

  /**
   * Clear all profiling data
   */
  clear(): void {
    this.sessions.clear()
    this.measurements.clear()
    this.currentSession = null
  }

  /**
   * Get performance summary statistics
   */
  getSummary() {
    const sessions = this.getSessions()
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        avgProcessingTime: 0,
        avgMemoryUsage: 0,
        slowestOperation: '',
        fastestOperation: ''
      }
    }

    const allMeasurements = sessions.flatMap(s => s.measurements)
    const sessionDurations = sessions.map(s => (s.endTime || 0) - s.startTime)

    const avgProcessingTime = sessionDurations.reduce((sum, dur) => sum + dur, 0) / sessions.length

    const memoryMeasurements = allMeasurements.filter(m => m.memoryDelta !== undefined)
    const avgMemoryUsage = memoryMeasurements.length > 0
      ? memoryMeasurements.reduce((sum, m) => sum + (m.memoryDelta || 0), 0) / memoryMeasurements.length
      : 0

    const sortedMeasurements = [...allMeasurements].sort((a, b) => b.duration - a.duration)
    const slowestOperation = sortedMeasurements[0]?.name || ''
    const fastestOperation = sortedMeasurements[sortedMeasurements.length - 1]?.name || ''

    return {
      totalSessions: sessions.length,
      avgProcessingTime,
      avgMemoryUsage,
      slowestOperation,
      fastestOperation
    }
  }

  /**
   * Create a performance report with detailed analysis
   */
  createReport(): import('../types/profiling').PerformanceReport {
    const sessions = this.getSessions()
    const allMeasurements = sessions.flatMap(s => s.measurements)

    // Group measurements by stage
    const stageGroups = new Map<string, PerformanceMeasurement[]>()
    allMeasurements.forEach(measurement => {
      const stage = measurement.name.split('_')[0] // Extract stage from name (e.g., 'detection_face' -> 'detection')
      if (!stageGroups.has(stage)) {
        stageGroups.set(stage, [])
      }
      stageGroups.get(stage)!.push(measurement)
    })

    // Calculate stage metrics
    const stages: StageMetrics[] = Array.from(stageGroups.entries()).map(([stage, measurements]) => {
      const durations = measurements.map(m => m.duration)
      const avgTime = durations.reduce((sum, d) => sum + d, 0) / durations.length
      const minTime = Math.min(...durations)
      const maxTime = Math.max(...durations)
      const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgTime, 2), 0) / durations.length
      const stdDev = Math.sqrt(variance)

      const memoryMeasurements = measurements.filter(m => m.memoryDelta !== undefined)
      const avgMemory = memoryMeasurements.length > 0
        ? memoryMeasurements.reduce((sum, m) => sum + (m.memoryDelta || 0), 0) / memoryMeasurements.length
        : 0
      const peakMemory = memoryMeasurements.length > 0
        ? Math.max(...memoryMeasurements.map(m => m.memoryDelta || 0))
        : 0

      return {
        stage,
        avgTime,
        minTime,
        maxTime,
        stdDev,
        count: measurements.length,
        memory: {
          avg: avgMemory,
          peak: peakMemory
        }
      }
    })

    // Calculate summary
    const totalVideos = sessions.length
    const totalProcessingTime = sessions.reduce((sum, s) => sum + ((s.endTime || 0) - s.startTime), 0)
    const avgTimePerVideo = totalVideos > 0 ? totalProcessingTime / totalVideos : 0
    const successRate = totalVideos > 0 ? sessions.filter(s => s.endTime !== undefined).length / totalVideos : 0

    // Identify bottlenecks
    const totalTime = stages.reduce((sum, stage) => sum + (stage.avgTime * stage.count), 0)
    const bottlenecks = stages
      .map(stage => ({
        stage: stage.stage,
        percentageOfTotalTime: (stage.avgTime * stage.count) / totalTime * 100,
        recommendations: this.generateRecommendations(stage)
      }))
      .sort((a, b) => b.percentageOfTotalTime - a.percentageOfTotalTime)
      .slice(0, 3) // Top 3 bottlenecks

    // Resource utilization
    const memoryMeasurements = allMeasurements.filter(m => m.memoryDelta !== undefined)
    const peakMemoryUsage = memoryMeasurements.length > 0 ? Math.max(...memoryMeasurements.map(m => m.memoryDelta || 0)) : 0
    const avgMemoryUsage = memoryMeasurements.length > 0
      ? memoryMeasurements.reduce((sum, m) => sum + (m.memoryDelta || 0), 0) / memoryMeasurements.length
      : 0

    // Calculate hot path breakdown
    const hotPathBreakdown: import('../types/profiling').HotPathBreakdown[] = stages
      .map(stage => {
        const stageMeasurements = stageGroups.get(stage.stage) || []
        const durations = stageMeasurements.map(m => m.duration)
        return {
          stage: stage.stage,
          totalTimeMs: stage.avgTime * stage.count,
          percentageOfTotal: totalTime > 0 ? (stage.avgTime * stage.count) / totalTime * 100 : 0,
          callCount: stage.count,
          avgTimePerCall: stage.avgTime,
          distribution: calculateDistributionStats(durations) || {
            p50: 0, p95: 0, p99: 0, min: 0, max: 0, mean: 0, stdDev: 0, count: 0
          }
        }
      })
      .sort((a, b) => b.totalTimeMs - a.totalTimeMs)

    // Calculate distribution statistics for key metrics
    const distributions = {
      decodeMsPerFrame: calculateDistributionStats(
        allMeasurements.filter(m => m.name.includes('decode')).map(m => m.duration / (m.frameCount || 1))
      ),
      gpuToCpuCopyMs: calculateDistributionStats(
        allMeasurements.filter(m => m.name.includes('gpu_to_cpu')).map(m => m.duration)
      ),
      detectorMs: calculateDistributionStats(
        allMeasurements.filter(m => m.name.includes('detector')).map(m => m.duration)
      ),
      trackerMs: calculateDistributionStats(
        allMeasurements.filter(m => m.name.includes('tracker')).map(m => m.duration)
      ),
      shotHistMs: calculateDistributionStats(
        allMeasurements.filter(m => m.name.includes('shot_hist')).map(m => m.duration)
      ),
      shotSsimMs: calculateDistributionStats(
        allMeasurements.filter(m => m.name.includes('shot_ssim')).map(m => m.duration)
      ),
      messageOverheadMs: calculateDistributionStats(
        allMeasurements.filter(m => m.name.includes('message')).map(m => m.duration)
      ),
      gcPauseMs: calculateDistributionStats(
        allMeasurements.filter(m => m.metadata?.gcPauseMs !== undefined).map(m => m.metadata!.gcPauseMs!)
      ),
      allocationsPerFrame: calculateDistributionStats(
        allMeasurements.filter(m => m.metadata?.allocationsCount !== undefined && m.frameCount)
          .map(m => m.metadata!.allocationsCount! / m.frameCount!)
      ),
      renderGpuMs: calculateDistributionStats(
        allMeasurements.filter(m => m.name.includes('render_gpu')).map(m => m.duration)
      ),
      encodeMs: calculateDistributionStats(
        allMeasurements.filter(m => m.name.includes('encode')).map(m => m.duration)
      )
    }

    return {
      generatedAt: new Date(),
      summary: {
        totalVideos,
        totalProcessingTime,
        avgTimePerVideo,
        successRate
      },
      stages,
      bottlenecks,
      resources: {
        avgCpuUtilization: 0, // Would need OS-level monitoring
        peakMemoryUsage,
        memoryEfficiency: totalVideos > 0 ? totalVideos / (peakMemoryUsage / (1024 * 1024)) : 0 // videos per MB
      },
      hotPathBreakdown,
      distributions
    }
  }

  /**
   * Generate recommendations for performance optimization
   */
  private generateRecommendations(stage: StageMetrics): string[] {
    const recommendations: string[] = []

    if (stage.avgTime > 100) {
      recommendations.push('Consider optimizing algorithm or reducing processing resolution')
    }

    if (stage.stdDev > stage.avgTime * 0.5) {
      recommendations.push('High variance detected - consider caching or precomputation')
    }

    if (stage.memory.peak > 100 * 1024 * 1024) { // 100MB
      recommendations.push('High memory usage - consider streaming processing or worker optimization')
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance looks good for this stage')
    }

    return recommendations
  }
}

/**
 * Calculate distribution statistics for an array of numbers
 */
function calculateDistributionStats(values: number[]): import('../types/profiling').DistributionStats | undefined {
  if (values.length === 0) return undefined

  const sorted = [...values].sort((a, b) => a - b)
  const count = values.length
  const mean = values.reduce((sum, val) => sum + val, 0) / count
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / count
  const stdDev = Math.sqrt(variance)

  const getPercentile = (p: number) => {
    const index = Math.floor((count - 1) * p)
    return sorted[index]
  }

  return {
    p50: getPercentile(0.5),
    p95: getPercentile(0.95),
    p99: getPercentile(0.99),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean,
    stdDev,
    count
  }
}

/**
 * Global profiler instance
 */
export const globalProfiler = new VideoProcessingProfiler()

/**
 * Convenience functions for common profiling patterns
 */
export const profiling = {
  /**
   * Profile an async operation
   */
  async profileAsync<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const measurementId = globalProfiler.startMeasurement(name, metadata)
    try {
      const result = await operation()
      globalProfiler.endMeasurement(measurementId)
      return result
    } catch (error) {
      globalProfiler.endMeasurement(measurementId)
      throw error
    }
  },

  /**
   * Profile a synchronous operation
   */
  profileSync<T>(
    name: string,
    operation: () => T,
    metadata?: Record<string, any>
  ): T {
    const measurementId = globalProfiler.startMeasurement(name, metadata)
    try {
      const result = operation()
      globalProfiler.endMeasurement(measurementId)
      return result
    } catch (error) {
      globalProfiler.endMeasurement(measurementId)
      throw error
    }
  },

  /**
   * Start a pipeline session
   */
  startPipeline(videoId: string, videoMetadata?: any): string {
    return globalProfiler.startSession(videoId, { video: videoMetadata })
  },

  /**
   * End a pipeline session
   */
  endPipeline(sessionId: string): void {
    globalProfiler.endSession(sessionId)
  },

  /**
   * Get current performance summary
   */
  getSummary() {
    return globalProfiler.getSummary()
  },

  /**
   * Export performance data
   */
  exportData(format: 'json' | 'csv' | 'console' = 'json'): string {
    return globalProfiler.exportData(format)
  }
}
