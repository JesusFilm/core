/**
 * Two-pass auto-crop pipeline types and interfaces
 */

import type {
  VideoMetadata,
  OutputTarget
} from './video-metadata'
import type { RenderingConfig } from './crop-path'
import type {
  ShotBoundary,
  SceneDetectionConfig
} from './scene-detection'
import { DEFAULT_SCENE_DETECTION_CONFIG } from './scene-detection'
import type {
  FaceTrackingResults,
  FaceTrackingConfig
} from './face-tracking'
import { DEFAULT_FACE_TRACKING_CONFIG } from './face-tracking'
import type {
  VirtualCameraPath,
  VirtualCameraParameters
} from './virtual-camera'
import { DEFAULT_VIRTUAL_CAMERA_PARAMS } from './virtual-camera'
import type {
  CropPath
} from './crop-path'
import { DEFAULT_RENDERING_CONFIG } from './crop-path'

/**
 * Analysis pass result - first pass output that becomes input to render pass
 */
export interface AnalysisResult {
  /** Video metadata extracted during probing */
  metadata: VideoMetadata
  /** Detected shot boundaries */
  shots: ShotBoundary[]
  /** Face tracking results across all shots */
  faceTracking: FaceTrackingResults
  /** Generated virtual camera path (smoothed and stabilized) */
  cameraPath: VirtualCameraPath
  /** Processing statistics */
  stats: {
    /** Total analysis time */
    totalTime: number
    /** Time spent on shot detection */
    shotDetectionTime: number
    /** Time spent on face detection/tracking */
    faceProcessingTime: number
    /** Time spent on path generation/smoothing */
    pathGenerationTime: number
    /** Frames processed per second */
    fps: number
  }
}

/**
 * Render pass input - the path JSON that serves as single source of truth
 */
export interface RenderInput {
  /** Source video identifier */
  videoId: string
  /** Path JSON - the single source of truth */
  path: CropPath
  /** Output specifications */
  output: OutputTarget
  /** Render configuration */
  config: RenderingConfig
}

/**
 * Pipeline stage enumeration
 */
export type PipelineStage =
  | 'probing'
  | 'shot_detection'
  | 'face_analysis'
  | 'path_generation'
  | 'path_smoothing'
  | 'rendering'
  | 'encoding'

/**
 * Pipeline progress tracking
 */
export interface PipelineProgress {
  /** Current stage */
  stage: PipelineStage
  /** Progress within current stage (0-100) */
  stageProgress: number
  /** Overall pipeline progress (0-100) */
  overallProgress: number
  /** Current frame being processed (if applicable) */
  currentFrame?: number
  /** Total frames to process (if applicable) */
  totalFrames?: number
  /** Estimated time remaining in seconds */
  eta?: number
  /** Processing speed in frames per second */
  fps?: number
}

/**
 * Pipeline error types
 */
export type PipelineErrorType =
  | 'video_decode_error'
  | 'metadata_extraction_error'
  | 'face_detection_error'
  | 'scene_detection_error'
  | 'path_generation_error'
  | 'render_error'
  | 'encoding_error'
  | 'memory_error'
  | 'timeout_error'

/**
 * Pipeline error with context
 */
export interface PipelineError {
  /** Error type */
  type: PipelineErrorType
  /** Human-readable message */
  message: string
  /** Stage where error occurred */
  stage: PipelineStage
  /** Additional context */
  context?: Record<string, any>
  /** Whether the error is recoverable */
  recoverable: boolean
}

/**
 * Complete pipeline result
 */
export interface PipelineResult {
  /** Whether processing succeeded */
  success: boolean
  /** Output file/blob URL (if successful) */
  outputUrl?: string
  /** Analysis results (first pass output) */
  analysisResult?: AnalysisResult
  /** Render statistics */
  renderStats?: {
    totalTime: number
    framesRendered: number
    averageFps: number
  }
  /** Errors encountered during processing */
  errors: PipelineError[]
  /** Warnings (non-fatal issues) */
  warnings: string[]
}

/**
 * Pipeline configuration combining all stage configs
 */
export interface PipelineConfig {
  /** Video probing configuration */
  probing: {
    /** Whether to extract detailed codec information */
    detailedCodecInfo: boolean
    /** Timeout for metadata extraction (seconds) */
    timeoutSeconds: number
  }
  /** Shot detection configuration */
  shotDetection: SceneDetectionConfig
  /** Face tracking configuration */
  faceTracking: FaceTrackingConfig
  /** Virtual camera path generation */
  cameraPath: VirtualCameraParameters
  /** Rendering configuration */
  rendering: RenderingConfig
  /** Performance settings */
  performance: {
    /** Whether to use Web Workers */
    useWorkers: boolean
    /** Memory limit per worker (MB) */
    workerMemoryLimit: number
    /** Overall pipeline timeout (seconds) */
    pipelineTimeoutSeconds: number
  }
  /** Performance optimization flags */
  perf?: {
    /** Whether to use WebCodecs for decoding */
    webcodecs_decode?: boolean
    /** Whether to use GPU delegate for detection */
    gpu_delegate?: boolean
    /** Whether to use VideoEncoder for rendering */
    videoencoder?: boolean
  }
  /** Debug settings */
  debug: {
    /** Whether to generate debug overlays */
    enableOverlays: boolean
    /** Whether to export intermediate results */
    exportIntermediates: boolean
  }
}

/**
 * Default pipeline configuration
 */
export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  probing: {
    detailedCodecInfo: true,
    timeoutSeconds: 30
  },
  shotDetection: DEFAULT_SCENE_DETECTION_CONFIG,
  faceTracking: DEFAULT_FACE_TRACKING_CONFIG,
  cameraPath: DEFAULT_VIRTUAL_CAMERA_PARAMS,
  rendering: DEFAULT_RENDERING_CONFIG,
  performance: {
    useWorkers: true,
    workerMemoryLimit: 500,
    pipelineTimeoutSeconds: 300 // 5 minutes
  },
  debug: {
    enableOverlays: false,
    exportIntermediates: false
  }
}

/**
 * Pipeline execution context
 */
export interface PipelineContext {
  /** Unique pipeline run ID */
  runId: string
  /** Source video information */
  video: {
    id: string
    url: string
    fileSize?: number
  }
  /** Configuration for this run */
  config: PipelineConfig
  /** Progress callback */
  onProgress?: (progress: PipelineProgress) => void
  /** Error callback */
  onError?: (error: PipelineError) => void
  /** Cancellation signal */
  abortController?: AbortController
}
