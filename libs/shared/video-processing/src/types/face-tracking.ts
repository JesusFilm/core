/**
 * Face tracking and detection types for auto-crop pipeline
 */

/**
 * Face detection result
 */
export interface FaceDetection {
  /** Unique identifier for this detection */
  id: string
  /** Timestamp in seconds */
  timestamp: number
  /** Bounding box */
  box: {
    x: number
    y: number
    width: number
    height: number
  }
  /** Detection confidence (0-1) */
  confidence: number
  /** Face landmarks (if available) */
  landmarks?: {
    leftEye: { x: number; y: number }
    rightEye: { x: number; y: number }
    nose: { x: number; y: number }
    leftMouth: { x: number; y: number }
    rightMouth: { x: number; y: number }
  }
  /** Face orientation angles (pitch, yaw, roll) in degrees */
  orientation?: {
    pitch: number
    yaw: number
    roll: number
  }
}

/**
 * Tracked face across multiple frames
 */
export interface TrackedFace {
  /** Unique tracking ID */
  trackId: string
  /** Face detections for this track */
  detections: FaceDetection[]
  /** Track metadata */
  metadata: {
    /** First seen timestamp */
    firstSeen: number
    /** Last seen timestamp */
    lastSeen: number
    /** Total time visible in seconds */
    totalVisibleTime: number
    /** Average confidence across all detections */
    avgConfidence: number
    /** Track stability score */
    stabilityScore: number
  }
  /** Last seen timestamp (convenience property) */
  lastSeen: number
  /** Current track state */
  state: 'active' | 'lost' | 'terminated'
}

/**
 * Primary face selection criteria
 */
export interface PrimaryFaceCriteria {
  /** Minimum confidence threshold */
  minConfidence: number
  /** Minimum face area threshold (relative to frame) */
  minFaceArea: number
  /** Time on screen weighting factor */
  timeOnScreenWeight: number
  /** Face area weighting factor */
  areaWeight: number
  /** Confidence weighting factor */
  confidenceWeight: number
  /** Sticky threshold - how much better a face needs to be to replace current primary */
  stickyThreshold: number
}

/**
 * Default criteria for primary face selection
 */
export const DEFAULT_PRIMARY_FACE_CRITERIA: PrimaryFaceCriteria = {
  minConfidence: 0.5,
  minFaceArea: 0.01, // 1% of frame area
  timeOnScreenWeight: 1.0,
  areaWeight: 1.0,
  confidenceWeight: 0.8,
  stickyThreshold: 0.1 // 10% improvement needed
}

/**
 * Face tracking configuration
 */
export interface FaceTrackingConfig {
  /** Detection cadence - run detection every N frames */
  detectionCadence: number
  /** Tracker prediction between detections */
  enableTrackerPrediction: boolean
  /** Maximum frames to track without detection */
  maxPredictionFrames: number
  /** Face confidence decay rate when predicted */
  confidenceDecayRate: number
  /** Primary face selection criteria */
  primaryFaceCriteria: PrimaryFaceCriteria
  /** Multi-face arbitration rules */
  arbitration: {
    /** Maximum number of faces to track simultaneously */
    maxConcurrentFaces: number
    /** Whether to prefer larger faces */
    preferLargerFaces: boolean
    /** Whether to prefer more confident detections */
    preferHigherConfidence: boolean
    /** Center bias weight */
    centerBiasWeight: number
  }
}

/**
 * Default face tracking configuration
 */
export const DEFAULT_FACE_TRACKING_CONFIG: FaceTrackingConfig = {
  detectionCadence: 3, // Detect every 3 frames
  enableTrackerPrediction: true,
  maxPredictionFrames: 10,
  confidenceDecayRate: 0.95,
  primaryFaceCriteria: DEFAULT_PRIMARY_FACE_CRITERIA,
  arbitration: {
    maxConcurrentFaces: 3,
    preferLargerFaces: true,
    preferHigherConfidence: true,
    centerBiasWeight: 0.2
  }
}

/**
 * Face tracking session results
 */
export interface FaceTrackingResults {
  /** All tracked faces */
  tracks: TrackedFace[]
  /** Primary face track ID at each timestamp */
  primaryFaceTimeline: Array<{
    timestamp: number
    primaryTrackId: string | null
    confidence: number
  }>
  /** Face detection statistics */
  stats: {
    totalDetections: number
    totalTracks: number
    avgDetectionsPerFrame: number
    primaryFaceSwitches: number
    avgTrackDuration: number
  }
}
