export type DetectionLabel = 'person' | 'face' | 'object'

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

export type DetectionWorkerMessage =
  | DetectionStreamChunk
  | DetectionStreamComplete
  | DetectionStreamError
