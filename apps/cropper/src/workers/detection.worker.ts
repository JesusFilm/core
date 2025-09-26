/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope

// Import MediaPipe Tasks Vision
import { FaceDetector, ObjectDetector, FilesetResolver } from '@mediapipe/tasks-vision'
import { TrackManager } from '../lib/face-tracking'

type StartDetectionMessage = {
  type: 'start'
  payload: {
    duration: number
    videoUrl?: string
    frameRate?: number
  }
}

type ProcessFrameMessage = {
  type: 'processFrame'
  payload: {
    frameData: ImageData | ImageBitmap
    timestamp: number
  }
}

type TerminateMessage = { type: 'terminate' }

type IncomingMessage = StartDetectionMessage | ProcessFrameMessage | TerminateMessage

type DetectionChunk = {
  type: 'chunk'
  result: {
    id: string
    time: number
    box: {
      x: number
      y: number
      width: number
      height: number
    }
    confidence: number
    label: 'face' | 'person' | 'silhouette' | 'center'
    source: 'mediapipe'
  }
}

type DetectionComplete = {
  type: 'complete'
  results: DetectionChunk['result'][]
}

type DetectionError = {
  type: 'error'
  error: string
}

type OutgoingMessage = DetectionChunk | DetectionComplete | DetectionError

let timer: number | undefined
let faceDetector: FaceDetector | null = null
let objectDetector: ObjectDetector | null = null
let trackManager: TrackManager | null = null
const detections: DetectionChunk['result'][] = []

const cleanup = () => {
  if (timer !== undefined) {
    clearInterval(timer)
    timer = undefined
  }
  if (faceDetector) {
    faceDetector.close()
    faceDetector = null
  }
  if (objectDetector) {
    objectDetector.close()
    objectDetector = null
  }
  if (trackManager) {
    trackManager.reset()
    trackManager = null
  }
  detections.length = 0
}

const sendMessage = (message: OutgoingMessage) => {
  self.postMessage(message)
}

const sendError = (error: string) => {
  sendMessage({ type: 'error', error })
}

const initializeFaceDetector = async (): Promise<FaceDetector | null> => {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
    )

    const faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
        delegate: 'CPU'
      },
      // Sets the minimum confidence score required for a face detection to be considered valid
      minDetectionConfidence: 0.5,
      // Controls how aggressively the detector suppresses overlapping detections
      minSuppressionThreshold: 0.5,
      maxResults: 5
    })

    return faceDetector
  } catch (error) {
    console.error('Failed to initialize MediaPipe FaceDetector:', error)
    return null
  }
}

const initializeObjectDetector = async (): Promise<ObjectDetector | null> => {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
    )

    const objectDetector = await ObjectDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite',
        delegate: 'CPU'
      },
      scoreThreshold: 0.3,
      categoryDenylist: [],
      categoryAllowlist: ['person'],
      maxResults: 3
    })

    return objectDetector
  } catch (error) {
    console.error('Failed to initialize MediaPipe ObjectDetector:', error)
    return null
  }
}

const handleStart = async (message: StartDetectionMessage) => {
  cleanup()

  try {
    // Initialize both detectors
    faceDetector = await initializeFaceDetector()
    objectDetector = await initializeObjectDetector()

    if (!faceDetector && !objectDetector) {
      sendError('MediaPipe initialization failed - no detectors available')
      return
    }

    const initializedDetectors = []
    if (faceDetector) initializedDetectors.push('FaceDetector')
    if (objectDetector) initializedDetectors.push('ObjectDetector')

    // Initialize tracking manager
    trackManager = new TrackManager()

    // Set up completion timer based on expected duration
    // The main thread will send processFrame messages for real detection
    // If no frames are received within the duration, we'll complete with what we have
    const completionTimeout = message.payload.duration * 1000 + 5000 // Add 5s buffer

    timer = self.setTimeout(() => {
      cleanup()
      const complete: DetectionComplete = { type: 'complete', results: detections.slice() }
      sendMessage(complete)
    }, completionTimeout)

  } catch (error) {
    console.error('Failed to start detection:', error)
    sendError(`Failed to start detection: ${error}`)
  }
}


// Helper function to calculate distance between centers of two boxes
const getBoxDistance = (box1: { x: number, y: number, width: number, height: number },
                       box2: { x: number, y: number, width: number, height: number }) => {
  const center1X = box1.x + box1.width / 2
  const center1Y = box1.y + box1.height / 2
  const center2X = box2.x + box2.width / 2
  const center2Y = box2.y + box2.height / 2

  return Math.sqrt(Math.pow(center2X - center1X, 2) + Math.pow(center2Y - center1Y, 2))
}

// Helper function to check if two boxes overlap or are very close
const boxesAreClose = (box1: { x: number, y: number, width: number, height: number },
                      box2: { x: number, y: number, width: number, height: number },
                      threshold = 0.1) => {
  // Check if boxes overlap
  const overlapX = Math.max(0, Math.min(box1.x + box1.width, box2.x + box2.width) - Math.max(box1.x, box2.x))
  const overlapY = Math.max(0, Math.min(box1.y + box1.height, box2.y + box2.height) - Math.max(box1.y, box2.y))
  const overlap = overlapX * overlapY > 0

  // Or check if centers are very close (within threshold)
  const distance = getBoxDistance(box1, box2)

  return overlap || distance < threshold
}

// Helper function to merge multiple detection boxes into one
const mergeDetectionBoxes = (detections: Array<{
  box: { x: number, y: number, width: number, height: number },
  confidence: number
}>) => {
  if (detections.length === 0) return null
  if (detections.length === 1) return detections[0]

  // Find the bounding box that encompasses all detections
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  let maxConfidence = 0

  for (const detection of detections) {
    minX = Math.min(minX, detection.box.x)
    minY = Math.min(minY, detection.box.y)
    maxX = Math.max(maxX, detection.box.x + detection.box.width)
    maxY = Math.max(maxY, detection.box.y + detection.box.height)
    maxConfidence = Math.max(maxConfidence, detection.confidence)
  }

  return {
    box: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    },
    confidence: maxConfidence
  }
}

// Helper function to group nearby detections
const groupNearbyDetections = (rawDetections: Array<{
  box: { x: number, y: number, width: number, height: number },
  confidence: number
}>, distanceThreshold = 0.1) => {
  const groups: Array<Array<typeof rawDetections[0]>> = []
  const processed = new Set<number>()

  for (let i = 0; i < rawDetections.length; i++) {
    if (processed.has(i)) continue

    const group = [rawDetections[i]]
    processed.add(i)

    // Find all detections close to this one
    for (let j = i + 1; j < rawDetections.length; j++) {
      if (processed.has(j)) continue

      if (boxesAreClose(rawDetections[i].box, rawDetections[j].box, distanceThreshold)) {
        group.push(rawDetections[j])
        processed.add(j)
      }
    }

    groups.push(group)
  }

  // Merge each group into a single detection
  return groups.map(group => mergeDetectionBoxes(group)).filter(Boolean) as Array<{
    box: { x: number, y: number, width: number, height: number },
    confidence: number
  }>
}

const handleProcessFrame = async (message: ProcessFrameMessage) => {
  if (!faceDetector && !objectDetector) {
    console.warn('No detectors initialized, skipping frame processing')
    return
  }

  if (!trackManager) {
    console.warn('Track manager not initialized, skipping frame processing')
    return
  }

  try {
    const { frameData, timestamp } = message.payload

    // Convert frame data to the format expected by MediaPipe
    let imageData: ImageData
    if (frameData instanceof ImageBitmap) {
      // Convert ImageBitmap to ImageData
      const canvas = new OffscreenCanvas(frameData.width, frameData.height)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }
      ctx.drawImage(frameData, 0, 0)
      imageData = ctx.getImageData(0, 0, frameData.width, frameData.height)
    } else {
      imageData = frameData
    }

    const rawDetections: Array<{
      box: { x: number, y: number, width: number, height: number },
      confidence: number,
      label: 'face' | 'person' | 'silhouette' | 'center'
    }> = []

    // Priority 1: Try face detection
    if (faceDetector) {
      try {
        const faceResult = faceDetector.detect(imageData)
        if (faceResult.detections && faceResult.detections.length > 0) {
          for (const detection of faceResult.detections) {
            const confidence = detection.categories[0]?.score || 0
            if (confidence >= 0.3) {
              rawDetections.push({
                box: {
                  x: Math.max(0, Math.min(1, detection.boundingBox.originX / imageData.width)),
                  y: Math.max(0, Math.min(1, detection.boundingBox.originY / imageData.height)),
                  width: Math.max(0, Math.min(1, detection.boundingBox.width / imageData.width)),
                  height: Math.max(0, Math.min(1, detection.boundingBox.height / imageData.height))
                },
                confidence,
                label: 'face'
              })
            }
          }
        }
      } catch (error) {
        console.warn('Face detection failed:', error)
      }
    }

    // Priority 2: Try person detection (only if no faces were found)
    if (rawDetections.length === 0 && objectDetector) {
      try {
        const objectResult = objectDetector.detect(imageData)
        if (objectResult.detections && objectResult.detections.length > 0) {
          for (const detection of objectResult.detections) {
            if (detection.categories[0]?.categoryName === 'person') {
              const confidence = detection.categories[0]?.score || 0
              if (confidence >= 0.3) {
                rawDetections.push({
                  box: {
                    x: Math.max(0, Math.min(1, detection.boundingBox.originX / imageData.width)),
                    y: Math.max(0, Math.min(1, detection.boundingBox.originY / imageData.height)),
                    width: Math.max(0, Math.min(1, detection.boundingBox.width / imageData.width)),
                    height: Math.max(0, Math.min(1, detection.boundingBox.height / imageData.height))
                  },
                  confidence,
                  label: 'person'
                })
              }
            }
          }
        }
      } catch (error) {
        console.warn('Object detection failed:', error)
      }
    }

    // Priority 3: If no faces or persons found, try silhouette detection
    if (rawDetections.length === 0 && objectDetector) {
      try {
        const objectResult = objectDetector.detect(imageData)
        if (objectResult.detections && objectResult.detections.length > 0) {
          for (const detection of objectResult.detections) {
            const confidence = detection.categories[0]?.score || 0
            if (confidence >= 0.2) { // Lower threshold for silhouettes
              rawDetections.push({
                box: {
                  x: Math.max(0, Math.min(1, detection.boundingBox.originX / imageData.width)),
                  y: Math.max(0, Math.min(1, detection.boundingBox.originY / imageData.height)),
                  width: Math.max(0, Math.min(1, detection.boundingBox.width / imageData.width)),
                  height: Math.max(0, Math.min(1, detection.boundingBox.height / imageData.height))
                },
                confidence: confidence * 0.8, // Reduce confidence for silhouette detection
                label: 'silhouette'
              })
            }
          }
        }
      } catch (error) {
        console.warn('Silhouette detection failed:', error)
      }
    }

    // Priority 4: If nothing detected, focus on center
    if (rawDetections.length === 0) {
      rawDetections.push({
        box: {
          x: 0.4, // Center of frame horizontally
          y: 0.4, // Center of frame vertically
          width: 0.2,
          height: 0.2
        },
        confidence: 0.1, // Very low confidence for center focus
        label: 'center'
      })
    }

    // Convert raw detections to DetectionResult format
    const detectionResults: DetectionResult[] = rawDetections.map(detection => ({
      id: `det-${Date.now()}-${Math.random()}`,
      time: timestamp,
      box: detection.box,
      confidence: detection.confidence,
      label: detection.label,
      source: 'mediapipe' as const,
      trackId: '' // Will be set by track manager
    }))

    // Process through track manager to get correlated results with track IDs
    const correlatedDetections = trackManager.processDetections(detectionResults, timestamp)

    // Send each correlated detection
    for (const result of correlatedDetections) {
      detections.push(result)
      const chunk: DetectionChunk = { type: 'chunk', result }
      sendMessage(chunk)
    }

  } catch (error) {
    console.error('Frame processing failed:', error)
    // Don't send error to main thread for individual frame failures
    // Just log and continue processing other frames
  }
}

self.onmessage = (event: MessageEvent<IncomingMessage>) => {
  const { data } = event

  if (data.type === 'start') {
    handleStart(data)
    return
  }

  if (data.type === 'processFrame') {
    handleProcessFrame(data)
    return
  }

  if (data.type === 'terminate') {
    cleanup()
  }
}

// Cleanup is handled in the terminate message handler
