// Scene Tracking Types for Object Tracking System

export interface SceneMetadata {
  id: string
  startTime: number
  endTime: number
  averageBrightness: number
  brightnessVariance: number
  dominantColors: ColorInfo[]
  compositionScore: number
  motionIntensity: number
  cameraMovement: boolean
  lightingCondition: 'bright' | 'normal' | 'dim' | 'dark'
  frameCount: number
}

export interface ColorInfo {
  r: number
  g: number
  b: number
  percentage: number
}

export interface SceneChangeEvent {
  id: string
  timestamp: number
  fromSceneId: string
  toSceneId: string
  changeType: SceneChangeType
  confidence: number
  metadata: SceneChangeMetadata
}

export type SceneChangeType =
  | 'brightness_change'
  | 'composition_change'
  | 'camera_movement'
  | 'lighting_change'
  | 'content_transition'

export interface SceneChangeMetadata {
  brightnessDelta: number
  colorShift: number
  motionMagnitude: number
  compositionChange: number
  processingTime: number
}

export interface SceneDetectionConfig {
  brightnessThreshold: number // 0-100, minimum brightness change to trigger scene change
  colorThreshold: number // 0-100, minimum color shift to trigger scene change
  motionThreshold: number // 0-100, minimum motion to trigger scene change
  compositionThreshold: number // 0-100, minimum composition change to trigger scene change
  temporalWindow: number // seconds, time window for averaging changes
  minSceneDuration: number // seconds, minimum duration for a scene
  maxSceneDuration: number // seconds, maximum duration for a scene before forced split
}

export interface SceneDetectionState {
  currentScene: SceneMetadata | null
  previousScene: SceneMetadata | null
  sceneHistory: SceneMetadata[]
  isDetecting: boolean
  lastChangeTime: number
  changeEvents: SceneChangeEvent[]
  config: SceneDetectionConfig
}

export interface SceneDetectionCallbacks {
  onSceneChange?: (event: SceneChangeEvent) => void
  onSceneUpdate?: (scene: SceneMetadata) => void
  onDetectionStart?: () => void
  onDetectionEnd?: () => void
  onError?: (error: string) => void
}

export interface SceneDetectionOptions {
  config?: Partial<SceneDetectionConfig>
  enableLogging?: boolean
  realtimeDetection?: boolean
}

// Hook return type for scene detection
export interface UseSceneDetectionReturn {
  currentScene: SceneMetadata | null
  sceneHistory: SceneMetadata[]
  changeEvents: SceneChangeEvent[]
  isDetecting: boolean
  startDetection: (videoElement: HTMLVideoElement, options?: SceneDetectionOptions) => void
  stopDetection: () => void
  getSceneAtTime: (time: number) => SceneMetadata | null
  getScenesInRange: (startTime: number, endTime: number) => SceneMetadata[]
  clearHistory: () => void
}

// Default configuration
export const DEFAULT_SCENE_DETECTION_CONFIG: SceneDetectionConfig = {
  brightnessThreshold: 15, // 15% brightness change
  colorThreshold: 20, // 20% color shift
  motionThreshold: 25, // 25% motion intensity
  compositionThreshold: 30, // 30% composition change
  temporalWindow: 2, // 2 seconds averaging window
  minSceneDuration: 3, // 3 seconds minimum scene
  maxSceneDuration: 300 // 5 minutes maximum scene
}
