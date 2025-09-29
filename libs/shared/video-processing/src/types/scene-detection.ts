/**
 * Scene detection and shot boundary types for auto-crop pipeline
 */

/**
 * Shot boundary detection result
 */
export interface ShotBoundary {
  /** Start frame number */
  startFrame: number
  /** End frame number */
  endFrame: number
  /** Start time in seconds */
  startTime: number
  /** End time in seconds */
  endTime: number
  /** Shot duration in seconds */
  duration: number
  /** Confidence score of the boundary detection */
  confidence: number
  /** Detection method used */
  method: 'histogram' | 'ssim' | 'edge_difference' | 'combined' | 'final' | 'histogram_gated'
  /** Additional metadata */
  metadata?: {
    /** Average histogram difference */
    histogramDiff?: number
    /** Average SSIM score */
    ssimScore?: number
    /** Edge difference score */
    edgeDiff?: number
    /** Processing time for this boundary */
    processingTime?: number
    /** Histogram gating information */
    gating?: {
      /** Histogram score that triggered gating decision */
      histogramScore?: number
      /** Whether SSIM was computed for this boundary */
      ssimComputed?: boolean
      /** SSIM computation reason */
      gatingReason?: 'below_low_threshold' | 'above_high_threshold' | 'in_range'
    }
  }
}

/**
 * Scene detection configuration for shot boundary detection
 */
export interface SceneDetectionConfig {
  /** Sampling method */
  sampling: {
    /** Sample every N frames (default: 2-3) */
    step: number
    /** Whether to use adaptive sampling based on motion */
    adaptive: boolean
  }
  /** Detection thresholds */
  thresholds: {
    /** Histogram difference threshold (0-1) */
    histogram: number
    /** SSIM difference threshold (0-1, lower = more sensitive) */
    ssim: number
    /** Edge difference threshold */
    edge: number
    /** Combined confidence threshold */
    combined: number
    /** Histogram gating thresholds for SSIM optimization */
    gating?: {
      /** Low threshold: below this, skip SSIM (no cut) */
      lowThreshold: number
      /** High threshold: above this, mark cut without SSIM */
      highThreshold: number
      /** Temporal debounce window for boundary decisions */
      temporalDebounce: number
    }
  }
  /** Processing parameters */
  processing: {
    /** Histogram bins per channel */
    histogramBins: number
    /** Gaussian blur kernel size for noise reduction */
    blurKernel: number
    /** Whether to use temporal smoothing */
    temporalSmoothing: boolean
    /** Temporal smoothing window size */
    temporalWindow: number
  }
  /** Performance settings */
  performance: {
    /** Downsample factor for processing (1 = full resolution) */
    downsampleFactor: number
    /** Maximum frame buffer size */
    maxBufferSize: number
    /** Whether to use WebGL acceleration */
    useWebGL: boolean
  }
}

/**
 * Default scene detection configuration
 */
export const DEFAULT_SCENE_DETECTION_CONFIG: SceneDetectionConfig = {
  sampling: {
    step: 3, // Sample every 3 frames
    adaptive: true
  },
  thresholds: {
    histogram: 0.15,
    ssim: 0.85,
    edge: 0.20,
    combined: 0.60,
    gating: {
      lowThreshold: 0.05,  // Below this, no SSIM (likely no cut)
      highThreshold: 0.25, // Above this, mark cut without SSIM
      temporalDebounce: 3  // Frames to debounce boundary decisions
    }
  },
  processing: {
    histogramBins: 32,
    blurKernel: 3,
    temporalSmoothing: true,
    temporalWindow: 5
  },
  performance: {
    downsampleFactor: 0.5, // Process at half resolution
    maxBufferSize: 10,
    useWebGL: true
  }
}

/**
 * Scene detection results
 */
export interface SceneDetectionResults {
  /** Detected shot boundaries */
  shots: ShotBoundary[]
  /** Processing statistics */
  stats: {
    /** Total frames processed */
    framesProcessed: number
    /** Total processing time */
    processingTime: number
    /** Average processing time per frame */
    avgProcessingTimePerFrame: number
    /** Total shots detected */
    totalShots: number
    /** Average shot duration */
    avgShotDuration: number
    /** Shot duration variance */
    shotDurationVariance: number
    /** Histogram gating statistics */
    gatingStats?: {
      /** Total histogram comparisons performed */
      totalComparisons: number
      /** Frames where SSIM was skipped (below low threshold) */
      ssimSkippedLow: number
      /** Frames where cut was marked without SSIM (above high threshold) */
      cutsWithoutSsim: number
      /** Frames where SSIM was computed */
      ssimComputed: number
      /** Percentage of frames reaching SSIM computation */
      ssimComputeRate: number
    }
  }
  /** Configuration used for detection */
  config: SceneDetectionConfig
  /** Debug information */
  debug?: {
    /** Frame differences for visualization */
    frameDifferences?: number[]
    /** Processing times per frame */
    frameProcessingTimes?: number[]
  }
}
