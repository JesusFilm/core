/**
 * Virtual camera path generation types for auto-crop pipeline
 */

/**
 * A keyframe in the virtual camera path defining crop window at a specific time
 */
export interface VirtualCameraKeyframe {
  /** Timestamp in seconds */
  t: number
  /** Center X coordinate (normalized 0-1 relative to source video) */
  cx: number
  /** Center Y coordinate (normalized 0-1 relative to source video) */
  cy: number
  /** Crop width (normalized 0-1 relative to source video) */
  cw: number
  /** Crop height (normalized 0-1 relative to source video) */
  ch: number
  /** Zoom factor (1.0 = no zoom, >1.0 = zoomed in) */
  zoom?: number
  /** Smoothing metadata for debugging */
  metadata?: {
    /** Confidence score of the face detection that generated this keyframe */
    faceConfidence?: number
    /** Face area as percentage of crop area */
    faceAreaRatio?: number
    /** Whether this keyframe was interpolated */
    interpolated?: boolean
    /** Processing stage that generated this keyframe */
    stage?: 'detection' | 'smoothing' | 'stabilization'
  }
}

/**
 * Virtual camera path consisting of keyframes over time
 */
export interface VirtualCameraPath {
  /** Unique identifier for this path */
  id: string
  /** Source video identifier */
  videoId: string
  /** Array of keyframes defining the camera movement */
  keyframes: VirtualCameraKeyframe[]
  /** Path metadata */
  metadata: {
    /** Total duration in seconds */
    duration: number
    /** Source video dimensions */
    sourceDimensions: { width: number; height: number }
    /** Target output dimensions */
    targetDimensions: { width: number; height: number }
    /** Creation timestamp */
    createdAt: Date
    /** Processing parameters used */
    parameters: VirtualCameraParameters
    /** Processing statistics */
    stats?: VirtualCameraStats
  }
}

/**
 * Parameters controlling virtual camera path generation
 */
export interface VirtualCameraParameters {
  /** Face height target as percentage of crop height (default: 35%) */
  faceHeightTarget: number
  /** Dead-zone width as percentage of crop width (default: 12%) */
  deadZoneWidth: number
  /** Dead-zone height as percentage of crop height (default: 10%) */
  deadZoneHeight: number
  /** Center bias for vertical positioning (+3-4% upward for UI safe area) */
  verticalCenterBias: number
  /** Smoothing parameters (1-Euro filter recommended) */
  smoothing: {
    /** 1-Euro filter beta for center position (default: 0.15) */
    centerBeta: number
    /** 1-Euro filter beta for zoom (default: 0.25) */
    zoomBeta: number
  }
  /** Stabilization parameters */
  stabilization: {
    /** Maximum pan velocity (crop-width/frame) */
    maxPanVelocity: number
    /** Maximum acceleration limit */
    maxAcceleration: number
  }
  /** Look-ahead buffer in frames for predictive smoothing */
  lookAheadFrames: number
  /** Maximum upscale factor allowed (default: 1.25x) */
  maxUpscale: number
}

/**
 * Default parameters for virtual camera path generation
 */
export const DEFAULT_VIRTUAL_CAMERA_PARAMS: VirtualCameraParameters = {
  faceHeightTarget: 0.35,
  deadZoneWidth: 0.12,
  deadZoneHeight: 0.10,
  verticalCenterBias: 0.04,
  smoothing: {
    centerBeta: 0.15,
    zoomBeta: 0.25
  },
  stabilization: {
    maxPanVelocity: 0.12,
    maxAcceleration: 0.05
  },
  lookAheadFrames: 12,
  maxUpscale: 1.25
}

/**
 * Processing statistics for virtual camera path generation
 */
export interface VirtualCameraStats {
  /** Total processing time in milliseconds */
  totalProcessingTime: number
  /** Number of frames processed */
  framesProcessed: number
  /** Average processing time per frame */
  avgProcessingTimePerFrame: number
  /** Number of face detections */
  faceDetections: number
  /** Number of scene changes detected */
  sceneChanges: number
  /** Path smoothness metrics */
  smoothness: {
    /** Average velocity of camera movement */
    avgVelocity: number
    /** Maximum velocity spike */
    maxVelocity: number
    /** Jitter score (lower is smoother) */
    jitterScore: number
  }
}

/**
 * Transition types between camera path segments
 */
export type CameraTransitionType =
  | 'hard_cut'     // Instant transition at scene boundary
  | 'face_swap'    // Primary face changes within same scene
  | 'face_lost'    // Face goes out of frame, fallback behavior
  | 'face_found'   // Face re-enters frame
  | 'scene_split'  // Scene split due to duration limits

/**
 * Camera transition metadata
 */
export interface CameraTransition {
  /** Transition type */
  type: CameraTransitionType
  /** Timestamp where transition occurs */
  timestamp: number
  /** Transition duration in frames */
  durationFrames: number
  /** Easing function applied */
  easing?: 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out'
}

/**
 * Override types for manual path adjustments
 */
export type OverrideType =
  | 'pin_region'        // Pin crop to specific region
  | 'swap_primary_face' // Force different face as primary
  | 'static_crop'       // Static crop window for time span
  | 'lock_zoom'         // Lock zoom level
  | 'lock_position'     // Lock center position

/**
 * Manual override for path segment
 */
export interface PathOverride {
  /** Unique identifier for this override */
  id: string
  /** Type of override */
  type: OverrideType
  /** Start time in seconds */
  startTime: number
  /** End time in seconds */
  endTime: number
  /** Override-specific parameters */
  parameters: {
    /** For pin_region: specific crop coordinates */
    region?: { cx: number; cy: number; cw: number; ch: number }
    /** For swap_primary_face: target face ID */
    faceId?: string
    /** For static_crop: fixed crop window */
    staticCrop?: { cx: number; cy: number; cw: number; ch: number }
    /** For lock_zoom: fixed zoom factor */
    zoom?: number
    /** For lock_position: fixed center coordinates */
    position?: { cx: number; cy: number }
  }
  /** User-provided reason for override */
  reason?: string
  /** Creation timestamp */
  createdAt: Date
}

/**
 * Enhanced virtual camera path with override support
 */
export interface VirtualCameraPathWithOverrides extends VirtualCameraPath {
  /** Manual overrides applied to this path */
  overrides: PathOverride[]
  /** Version number for override tracking */
  version: number
  /** Whether this path has been manually edited */
  hasManualEdits: boolean
}

/**
 * QA metrics for path validation
 */
export interface PathQAMetrics {
  /** Face coverage metrics */
  faceCoverage: {
    /** Percentage of time face is fully visible */
    fullFaceVisible: number
    /** Average face area as percentage of crop */
    avgFaceAreaRatio: number
    /** Frames with forehead cut off */
    foreheadCutoffs: number
    /** Frames with chin cut off */
    chinCutoffs: number
  }
  /** Motion stability metrics */
  motionStability: {
    /** Average pan velocity */
    avgPanVelocity: number
    /** Maximum pan velocity spike */
    maxPanVelocity: number
    /** Jitter score (lower is smoother) */
    jitterScore: number
    /** Frames with excessive velocity */
    excessiveVelocityFrames: number
  }
  /** Scene transition metrics */
  sceneTransitions: {
    /** Scene cuts where camera panned across boundary */
    pansAcrossCuts: number
    /** Hard cuts without smooth transitions */
    hardCuts: number
    /** Face swaps without easing */
    unEasedFaceSwaps: number
  }
  /** Overall QA score (0-100) */
  overallScore: number
  /** Critical issues found */
  criticalIssues: string[]
  /** Warnings for review */
  warnings: string[]
}
