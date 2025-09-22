export type DetectionLabel = 'person' | 'face' | 'silhouette' | 'center' | 'object'

export interface DetectionBox {
  x: number
  y: number
  width: number
  height: number
}

export interface DetectionResult {
  id: string
  time: number
  box: DetectionBox
  confidence: number
  label: DetectionLabel
  source: 'mediapipe'
}

export interface DetectionStreamChunk {
  type: 'chunk'
  result: DetectionResult
}

export interface DetectionStreamComplete {
  type: 'complete'
  results: DetectionResult[]
}

export interface DetectionStreamError {
  type: 'error'
  error: string
}


// Scene Change Detection Types
export type SceneChangeLevel = 'stable' | 'moderate' | 'significant' | 'transition'

export interface SceneChangeResult {
  id: string
  time: number
  changePercentage: number
  level: SceneChangeLevel
  motionVectors?: {
    dominantDirection: number // angle in radians
    magnitude: number
    isCameraMovement: boolean
  }
  metadata: {
    thresholdUsed: number
    processingTime: number
    frameCount: number
  }
}

export interface SceneChangeConfig {
  frameRate: number // fps for scene detection (default: 2)
  threshold: {
    stable: number // 0-10%
    moderate: number // 10-30%
    significant: number // 30-70%
    transition: number // 70-100%
  }
  noiseReduction: {
    gaussianBlur: number // kernel size (default: 3)
    morphologicalOps: boolean // default: true
    temporalSmoothing: number // frames to average (default: 3)
  }
  performance: {
    downsampleTo: { width: number; height: number } // default: 320x180
    useWebGL: boolean // default: true
    maxFrameBuffer: number // default: 5
  }
}

export interface SceneChangeStreamChunk {
  type: 'sceneChunk'
  result: SceneChangeResult
}

export interface SceneChangeStreamComplete {
  type: 'sceneComplete'
  results: SceneChangeResult[]
}

export interface SceneChangeStreamError {
  type: 'sceneError'
  error: string
}


export type SceneChangeWorkerMessage =
  | SceneChangeStreamChunk
  | SceneChangeStreamComplete
  | SceneChangeStreamError

export type DetectionWorkerMessage =
  | DetectionStreamChunk
  | DetectionStreamComplete
  | DetectionStreamError
