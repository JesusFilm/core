/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope

// Import MediaPipe Tasks Vision
import { ObjectDetector, FilesetResolver } from '@mediapipe/tasks-vision'

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
    label: 'person'
    source: 'mediapipe' | 'mock'
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

type DebugMessage = {
  type: 'debug'
  mediapipeInitialized?: boolean
  mediapipeFailed?: boolean
}

type OutgoingMessage = DetectionChunk | DetectionComplete | DetectionError | DebugMessage

let timer: number | undefined
let detector: ObjectDetector | null = null
const detections: DetectionChunk['result'][] = []

const cleanup = () => {
  if (timer !== undefined) {
    clearInterval(timer)
    timer = undefined
  }
  if (detector) {
    detector.close()
    detector = null
  }
  detections.length = 0
}

const sendMessage = (message: OutgoingMessage) => {
  self.postMessage(message)
}

const sendError = (error: string) => {
  sendMessage({ type: 'error', error })
}

const initializeDetector = async (): Promise<ObjectDetector | null> => {
  try {
    console.log('Initializing MediaPipe ObjectDetector...')

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

    console.log('MediaPipe ObjectDetector initialized successfully')
    return objectDetector
  } catch (error) {
    console.error('Failed to initialize MediaPipe ObjectDetector:', error)
    // Return null to indicate fallback to mock detection
    return null
  }
}

const handleStart = async (message: StartDetectionMessage) => {
  cleanup()

  try {
    // Initialize MediaPipe ObjectDetector
    detector = await initializeDetector()

    if (!detector) {
      console.warn('MediaPipe initialization failed, falling back to mock detection')
      sendMessage({ type: 'debug', mediapipeFailed: true })
      // Fallback to mock detection if MediaPipe fails
      fallbackToMockDetection(message.payload.duration)
      return
    }

    sendMessage({ type: 'debug', mediapipeInitialized: true })

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
    sendMessage({ type: 'debug', mediapipeFailed: true })
    // Fallback to mock detection on error
    fallbackToMockDetection(message.payload.duration)
  }
}

const fallbackToMockDetection = (duration: number) => {
  console.log('Using mock detection as fallback')

  const step = 0.5
  const totalFrames = Math.max(4, Math.ceil(duration / step))
  let index = 0

  timer = self.setInterval(() => {
    const time = Number((index * step).toFixed(2))

    // Generate mock detection result
    const oscillation = Math.sin(index / Math.max(totalFrames / 4, 1))
    const result: DetectionChunk['result'] = {
      id: `det-mock-${Date.now()}-${index}`,
      time,
      box: {
        x: Math.max(0.05, Math.min(0.65, 0.3 + oscillation * 0.2)),
        y: Math.max(0.05, Math.min(0.6, 0.25 + Math.cos(oscillation) * 0.1)),
        width: 0.28,
        height: 0.55
      },
      confidence: 0.86,
      label: 'person',
      source: 'mock'
    }

    detections.push(result)
    const chunk: DetectionChunk = { type: 'chunk', result }
    sendMessage(chunk)

    index += 1

    if (index >= totalFrames) {
      cleanup()
      const complete: DetectionComplete = { type: 'complete', results: detections.slice() }
      sendMessage(complete)
    }
  }, 180)
}

const handleProcessFrame = async (message: ProcessFrameMessage) => {
  if (!detector) {
    console.warn('Detector not initialized, skipping frame processing')
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

    // Run detection on the frame
    const detectionResult = detector.detect(imageData)

    // Process detection results
    if (detectionResult.detections && detectionResult.detections.length > 0) {
      for (const detection of detectionResult.detections) {
        if (detection.categories[0]?.categoryName === 'person') {
          const boundingBox = detection.boundingBox
          const confidence = detection.categories[0].score

          // Only include detections above confidence threshold
          if (confidence >= 0.3 && boundingBox) {
            const result: DetectionChunk['result'] = {
              id: `det-${Date.now()}-${Math.random()}`,
              time: timestamp,
              box: {
                x: Math.max(0, Math.min(1, boundingBox.originX / imageData.width)),
                y: Math.max(0, Math.min(1, boundingBox.originY / imageData.height)),
                width: Math.max(0, Math.min(1, boundingBox.width / imageData.width)),
                height: Math.max(0, Math.min(1, boundingBox.height / imageData.height))
              },
              confidence,
              label: 'person',
              source: 'mediapipe'
            }

            detections.push(result)
            const chunk: DetectionChunk = { type: 'chunk', result }
            sendMessage(chunk)
          }
        }
      }
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
