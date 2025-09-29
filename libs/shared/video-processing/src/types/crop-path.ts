/**
 * Crop path and rendering types for auto-crop pipeline
 */

/**
 * Crop window definition at a specific time
 */
export interface CropWindow {
  /** Center X coordinate (normalized 0-1) */
  centerX: number
  /** Center Y coordinate (normalized 0-1) */
  centerY: number
  /** Crop width (normalized 0-1) */
  width: number
  /** Crop height (normalized 0-1) */
  height: number
  /** Zoom factor */
  zoom: number
}

/**
 * Crop path entry for serialization
 */
export interface CropPathEntry {
  /** Timestamp in seconds */
  t: number
  /** Center X */
  cx: number
  /** Center Y */
  cy: number
  /** Crop width */
  cw: number
  /** Crop height */
  ch: number
  /** Optional zoom factor */
  z?: number
  /** Optional metadata for overrides and debugging */
  metadata?: {
    /** Whether this entry was manually overridden */
    manuallyOverridden?: boolean
    /** Reason for manual override */
    overrideReason?: string
  }
}

/**
 * Complete crop path for a video
 */
export interface CropPath {
  /** Unique identifier */
  id: string
  /** Source video identifier */
  videoId: string
  /** Version for tracking changes */
  version: string
  /** Path entries */
  entries: CropPathEntry[]
  /** Path metadata */
  metadata: {
    /** Source video dimensions */
    sourceWidth: number
    sourceHeight: number
    /** Target output dimensions */
    targetWidth: number
    targetHeight: number
    /** Total duration */
    duration: number
    /** Creation timestamp */
    createdAt: Date
    /** Last modified timestamp */
    modifiedAt: Date
    /** Processing parameters used */
    parameters: Record<string, any>
    /** Quality metrics */
    quality?: {
      /** Smoothness score (0-1, higher is smoother) */
      smoothness: number
      /** Coverage score (0-1, higher means less cropping) */
      coverage: number
      /** Stability score (0-1, higher means less jitter) */
      stability: number
    }
  }
}

/**
 * Rendering configuration
 */
export interface RenderingConfig {
  /** Output video settings */
  output: {
    width: number
    height: number
    fps: number
    format: 'mp4' | 'webm'
  }
  /** Encoding settings */
  encoding: {
    videoCodec: string
    videoBitrate: number // in Mbps
    audioCodec: string
    audioBitrate: number // in kbps
    keyframeInterval: number // in seconds
    profile: 'baseline' | 'main' | 'high'
  }
  /** Background fill options for undersized crops */
  background: {
    /** Fill strategy */
    strategy: 'blur' | 'black' | 'extend'
    /** Blur radius for blur strategy */
    blurRadius?: number
  }
  /** Worker configuration */
  worker: {
    /** Batch size for frame processing */
    batchSize: number
    /** Memory limit per worker */
    memoryLimit: number
  }
}

/**
 * Default rendering configuration
 */
export const DEFAULT_RENDERING_CONFIG: RenderingConfig = {
  output: {
    width: 1080,
    height: 1920,
    fps: 30,
    format: 'mp4'
  },
  encoding: {
    videoCodec: 'h264',
    videoBitrate: 8,
    audioCodec: 'aac',
    audioBitrate: 128,
    keyframeInterval: 2,
    profile: 'high'
  },
  background: {
    strategy: 'blur',
    blurRadius: 10
  },
  worker: {
    batchSize: 30, // 1 second at 30fps
    memoryLimit: 500 * 1024 * 1024 // 500MB
  }
}

/**
 * Rendering progress and status
 */
export interface RenderingProgress {
  /** Current rendering stage */
  stage: 'initializing' | 'probing' | 'analyzing' | 'generating_path' | 'rendering' | 'encoding' | 'complete'
  /** Progress percentage (0-100) */
  progress: number
  /** Estimated time remaining in seconds */
  eta: number
  /** Current frame being processed */
  currentFrame?: number
  /** Total frames to process */
  totalFrames?: number
  /** Processing speed in frames per second */
  fps?: number
  /** Memory usage in MB */
  memoryUsage?: number
}

/**
 * Rendering results
 */
export interface RenderingResult {
  /** Output file path or blob URL */
  outputUrl: string
  /** File size in bytes */
  fileSize: number
  /** Actual duration of output video */
  duration: number
  /** Processing statistics */
  stats: {
    /** Total processing time */
    totalTime: number
    /** Average encoding speed in fps */
    avgEncodingFps: number
    /** Peak memory usage */
    peakMemoryUsage: number
    /** Quality metrics */
    quality: {
      /** PSNR score (higher is better) */
      psnr?: number
      /** SSIM score (higher is better) */
      ssim?: number
    }
  }
  /** Any warnings or issues encountered */
  warnings: string[]
}
