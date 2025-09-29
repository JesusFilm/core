/**
 * Profiling and benchmarking types for auto-crop pipeline performance monitoring
 */

/**
 * Performance measurement for a single operation
 */
export interface PerformanceMeasurement {
  /** Operation name */
  name: string
  /** Start timestamp */
  startTime: number
  /** End timestamp */
  endTime: number
  /** Duration in milliseconds */
  duration: number
  /** Memory usage at start (optional) */
  startMemory?: number
  /** Memory usage at end (optional) */
  endMemory?: number
  /** Memory delta in bytes */
  memoryDelta?: number
  /** Additional metadata */
  metadata?: Record<string, any>
  /** Frame count for per-frame operations */
  frameCount?: number
  /** Bytes transferred (for message overhead) */
  bytesTransferred?: number
  /** GC pause duration (if measured) */
  gcPauseMs?: number
  /** Allocations count */
  allocationsCount?: number
  /** GPU-to-CPU copy time (getImageData, readPixels, etc.) */
  gpuToCpuCopyMs?: number
  /** Tracker performance metrics */
  tracker?: {
    /** Correlation score for successful tracking */
    correlationScore?: number
    /** Innovation score (motion/stability metric) */
    innovationScore?: number
    /** Tracker confidence */
    confidence?: number
    /** Frames since last detection update */
    framesSinceDetection?: number
  }
  /** Adaptive cadence metrics */
  cadence?: {
    /** Current detection cadence (frames between detections) */
    currentCadence?: number
    /** Cadence decision reason */
    decisionReason?: string
    /** Expected efficiency improvement */
    expectedEfficiency?: number
    /** Global motion magnitude */
    globalMotionMagnitude?: number
  }
}

/**
 * Profiling session for a complete pipeline run
 */
export interface ProfilingSession {
  /** Session identifier */
  id: string
  /** Video identifier being processed */
  videoId: string
  /** Start timestamp */
  startTime: number
  /** End timestamp (when completed) */
  endTime?: number
  /** Pipeline stage measurements */
  measurements: PerformanceMeasurement[]
  /** Session metadata */
  metadata: {
    /** Video properties */
    video: {
      duration: number
      width: number
      height: number
      fps: number
      fileSize?: number
    }
    /** Processing parameters */
    parameters: Record<string, any>
    /** Feature flags used */
    flags: {
      perf_webcodecs_decode: boolean
      perf_gpu_delegate: boolean
      perf_videoencoder: boolean
      [key: string]: boolean
    }
    /** Hardware/software environment */
    environment: {
      /** Browser/user agent */
      userAgent: string
      /** Hardware concurrency (logical processors) */
      hardwareConcurrency: number
      /** Device memory in GB (if available) */
      deviceMemory?: number
      /** WebGL support */
      webGLSupported: boolean
      /** WebAssembly support */
      wasmSupported: boolean
      /** SIMD support in WASM */
      wasmSimdSupported: boolean
      /** Thread support in WASM */
      wasmThreadsSupported: boolean
      /** Cross-origin isolation status */
      crossOriginIsolated: boolean
      /** Face detector backend used */
      detectorBackend?: 'webgpu' | 'webgl' | 'wasm_simd' | 'wasm' | 'cpu'
    }
  }
}

/**
 * Benchmark results for comparing different configurations
 */
export interface BenchmarkResult {
  /** Benchmark identifier */
  id: string
  /** Configuration being tested */
  config: Record<string, any>
  /** Performance metrics */
  metrics: {
    /** Total processing time in milliseconds */
    totalTime: number
    /** Processing time per second of video */
    timePerSecond: number
    /** Average memory usage in MB */
    avgMemoryUsage: number
    /** Peak memory usage in MB */
    peakMemoryUsage: number
    /** Processing speed in frames per second */
    processingFps: number
    /** CPU utilization percentage */
    cpuUtilization?: number
  }
  /** Quality metrics (if applicable) */
  quality?: {
    /** Output video quality score */
    videoQuality: number
    /** Audio quality score (if applicable) */
    audioQuality?: number
  }
  /** Success/failure status */
  status: 'success' | 'failed' | 'timeout'
  /** Error message (if failed) */
  error?: string
}

/**
 * Profiling harness configuration
 */
export interface ProfilingConfig {
  /** Whether profiling is enabled */
  enabled: boolean
  /** Sampling rate (1.0 = every operation, 0.1 = 10% of operations) */
  samplingRate: number
  /** Memory profiling enabled */
  memoryProfiling: boolean
  /** Maximum profiling sessions to keep */
  maxSessions: number
  /** Export format */
  exportFormat: 'json' | 'csv' | 'console'
  /** Custom metrics to track */
  customMetrics: string[]
}

/**
 * Default profiling configuration
 */
export const DEFAULT_PROFILING_CONFIG: ProfilingConfig = {
  enabled: true,
  samplingRate: 1.0,
  memoryProfiling: true,
  maxSessions: 100,
  exportFormat: 'json',
  customMetrics: []
}

/**
 * Performance profiler class interface
 */
export interface PerformanceProfiler {
  /** Start a new profiling session */
  startSession(videoId: string, metadata?: Record<string, any>): string

  /** End a profiling session */
  endSession(sessionId: string): ProfilingSession | null

  /** Start measuring an operation */
  startMeasurement(name: string, metadata?: Record<string, any>): string

  /** End measuring an operation */
  endMeasurement(measurementId: string): PerformanceMeasurement | null

  /** Get current session */
  getCurrentSession(): ProfilingSession | null

  /** Get all completed sessions */
  getSessions(): ProfilingSession[]

  /** Export profiling data */
  exportData(format?: ProfilingConfig['exportFormat']): string

  /** Clear all profiling data */
  clear(): void

  /** Get performance summary statistics */
  getSummary(): {
    totalSessions: number
    avgProcessingTime: number
    avgMemoryUsage: number
    slowestOperation: string
    fastestOperation: string
  }
}

/**
 * Stage-specific performance metrics
 */
export interface StageMetrics {
  /** Stage name */
  stage: string
  /** Average processing time */
  avgTime: number
  /** Minimum processing time */
  minTime: number
  /** Maximum processing time */
  maxTime: number
  /** Standard deviation */
  stdDev: number
  /** Sample count */
  count: number
  /** Memory usage statistics */
  memory: {
    avg: number
    peak: number
  }
}

/**
 * Distribution statistics for performance metrics
 */
export interface DistributionStats {
  /** 50th percentile (median) */
  p50: number
  /** 95th percentile */
  p95: number
  /** 99th percentile */
  p99: number
  /** Minimum value */
  min: number
  /** Maximum value */
  max: number
  /** Mean value */
  mean: number
  /** Standard deviation */
  stdDev: number
  /** Sample count */
  count: number
}

/**
 * Hot path breakdown for identifying performance bottlenecks
 */
export interface HotPathBreakdown {
  /** Stage name */
  stage: string
  /** Total time spent in this stage */
  totalTimeMs: number
  /** Percentage of total processing time */
  percentageOfTotal: number
  /** Call count for this stage */
  callCount: number
  /** Average time per call */
  avgTimePerCall: number
  /** Distribution statistics */
  distribution: DistributionStats
}

/**
 * Pipeline performance report
 */
export interface PerformanceReport {
  /** Report generation timestamp */
  generatedAt: Date
  /** Video processing summary */
  summary: {
    totalVideos: number
    totalProcessingTime: number
    avgTimePerVideo: number
    successRate: number
  }
  /** Stage-by-stage performance */
  stages: StageMetrics[]
  /** Bottleneck analysis */
  bottlenecks: Array<{
    stage: string
    percentageOfTotalTime: number
    recommendations: string[]
  }>
  /** Resource utilization */
  resources: {
    avgCpuUtilization: number
    peakMemoryUsage: number
    memoryEfficiency: number // processed frames per MB
  }
  /** Hot path breakdown */
  hotPathBreakdown: HotPathBreakdown[]
  /** Distribution statistics for key metrics */
  distributions: {
    decodeMsPerFrame?: DistributionStats
    gpuToCpuCopyMs?: DistributionStats
    detectorMs?: DistributionStats
    trackerMs?: DistributionStats
    shotHistMs?: DistributionStats
    shotSsimMs?: DistributionStats
    messageOverheadMs?: DistributionStats
    gcPauseMs?: DistributionStats
    allocationsPerFrame?: DistributionStats
    renderGpuMs?: DistributionStats
    encodeMs?: DistributionStats
  }
}
