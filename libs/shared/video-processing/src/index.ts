/**
 * Shared video processing types and utilities for auto-crop pipeline
 */

// Export all types
export * from './types'

// Export utilities
export * from './lib/profiler'
export * from './lib/probe'
export * from './lib/scene-detection'
export * from './lib/face-analysis'
export * from './lib/analysis-pass'
export * from './lib/virtual-camera'
export * from './lib/render-pass'
export * from './lib/render-worker'
export * from './lib/qa-analysis'
export * from './lib/decoding/decode-manager'

// Export default configurations
export {
  DEFAULT_OUTPUT_TARGET,
  HIGH_QUALITY_OUTPUT_TARGET
} from './types/video-metadata'

export {
  DEFAULT_VIRTUAL_CAMERA_PARAMS
} from './types/virtual-camera'

export {
  DEFAULT_PRIMARY_FACE_CRITERIA,
  DEFAULT_FACE_TRACKING_CONFIG
} from './types/face-tracking'

export {
  DEFAULT_SCENE_DETECTION_CONFIG
} from './types/scene-detection'

export {
  DEFAULT_RENDERING_CONFIG
} from './types/crop-path'

export {
  DEFAULT_PROFILING_CONFIG
} from './types/profiling'

export {
  DEFAULT_PIPELINE_CONFIG
} from './types/pipeline'
