import type {
  SceneChangeResult,
  SceneChangeConfig,
  SceneChangeWorkerMessage
} from '../types/detection'
import { getFrameRateInterval } from '../config/frame-rate-config'

export interface SceneChangeCallbacks {
  onChunk?: (result: SceneChangeResult) => void
  onComplete?: (results: SceneChangeResult[]) => void
  onError?: (error: string) => void
}

export interface SceneChangeOptions {
  config?: Partial<SceneChangeConfig>
}

export class SceneDetectionWorkerController {
  private worker?: Worker
  private results: SceneChangeResult[] = []
  private videoElement?: HTMLVideoElement
  private canvas?: OffscreenCanvas
  private ctx?: OffscreenCanvasRenderingContext2D
  private isExtractionPaused: boolean = false
  private extractionTimeoutId?: number
  private lastProcessedTime: number = 0

  start(duration: number, callbacks: SceneChangeCallbacks, options: SceneChangeOptions = {}, videoElement?: HTMLVideoElement) {
    if (typeof window === 'undefined') {
      return
    }

    this.stop()
    this.results = []
    this.isExtractionPaused = false
    this.lastProcessedTime = 0

    // Store video element reference
    this.videoElement = videoElement

    // Initialize canvas if we have a video element
    if (videoElement && !this.initializeCanvas(videoElement)) {
      callbacks.onError?.('Failed to initialize canvas for scene detection')
      return
    }

    this.worker = new Worker(new URL('../workers/scene-detection.worker.ts', import.meta.url), {
      type: 'module'
    })

    this.worker.onmessage = (event: MessageEvent<SceneChangeWorkerMessage>) => {
      const message = event.data

      if (message.type === 'sceneChunk') {
        this.results.push(message.result)
        callbacks.onChunk?.(message.result)
        return
      }

      if (message.type === 'sceneComplete') {
        this.results = message.results
        callbacks.onComplete?.(message.results)
        return
      }

      if (message.type === 'sceneError') {
        callbacks.onError?.(message.error)
      }

    }

    this.worker.onerror = (event) => {
      callbacks.onError?.(event.message)
    }

    // Start detection with video processing
    this.startVideoProcessing(duration, options, callbacks)

    // Start frame extraction if we have a video element
    if (videoElement) {
      this.startFrameExtraction()
    }
  }

  private setupVideoElement(options: SceneChangeOptions) {
    if (options.config?.performance?.downsampleTo) {
      // For scene detection, we create a basic canvas that will be resized when video loads
      this.canvas = new OffscreenCanvas(
        options.config.performance.downsampleTo.width,
        options.config.performance.downsampleTo.height
      )
      this.ctx = this.canvas.getContext('2d') || undefined
    }
  }

  // Initialize canvas for frame extraction
  private initializeCanvas(videoElement: HTMLVideoElement): boolean {
    try {
      // Create canvas sized to video dimensions initially
      this.canvas = new OffscreenCanvas(videoElement.videoWidth || 1920, videoElement.videoHeight || 1080)
      this.ctx = this.canvas.getContext('2d') || undefined

      if (!this.ctx) {
        console.error('Scene detection: Could not get canvas context')
        return false
      }

      return true
    } catch (error) {
      console.error('Scene detection: Canvas initialization failed', error)
      return false
    }
  }

  // Extract frame from video element
  private extractFrame(): ImageData | null {
    if (!this.videoElement || !this.canvas || !this.ctx) {
      return null
    }

    try {
      // Update canvas size if video dimensions changed
      if (this.canvas.width !== this.videoElement.videoWidth || this.canvas.height !== this.videoElement.videoHeight) {
        this.canvas.width = this.videoElement.videoWidth
        this.canvas.height = this.videoElement.videoHeight
      }

      this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height)
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
      return imageData
    } catch (error) {
      console.error('🎬 [DEBUG] Frame extraction failed:', error)
      return null
    }
  }

  // Start frame extraction loop
  private startFrameExtraction() {
    if (!this.videoElement || !this.worker) {
      console.error('Scene detection: Cannot start frame extraction - missing video element or worker')
      return
    }

    const extractFrame = () => {
      if (this.isExtractionPaused || !this.videoElement || !this.worker) {
        return
      }

      const currentTime = this.videoElement.currentTime

      // Throttle frame processing using global frame rate config
      if (currentTime - this.lastProcessedTime < getFrameRateInterval('SCENE_DETECTION') / 1000) {
        this.extractionTimeoutId = window.setTimeout(extractFrame, 100)
        return
      }

      this.lastProcessedTime = currentTime

      const frameData = this.extractFrame()
      if (frameData) {
        // Send frame to worker
        this.worker.postMessage({
          type: 'processSceneFrame',
          payload: {
            frameData,
            timestamp: currentTime
          }
        })
      } else {
        console.log(`🎬 [DEBUG] Frame extraction failed at ${currentTime.toFixed(2)}s`)
      }

      // Schedule next frame extraction
      this.extractionTimeoutId = window.setTimeout(extractFrame, 250) // 4 FPS
    }

    // Start extraction
    extractFrame()
  }

  private async startVideoProcessing(duration: number, options: SceneChangeOptions, callbacks: SceneChangeCallbacks) {
    if (!this.worker) {
      // Fallback to mock processing if no worker available
      this.worker?.postMessage({
        type: 'startSceneDetection',
        payload: {
          duration,
          config: options.config
        }
      })
      return
    }

    // Start the worker
    this.worker.postMessage({
      type: 'startSceneDetection',
      payload: {
        duration,
        config: options.config
      }
    })
  }

  pauseExtraction() {
    this.isExtractionPaused = true
    if (this.extractionTimeoutId) {
      clearTimeout(this.extractionTimeoutId)
      this.extractionTimeoutId = undefined
    }
  }

  resumeExtraction() {
    this.isExtractionPaused = false
  }

  stop() {
    if (this.worker) {
      this.worker.postMessage({ type: 'terminateSceneDetection' })
      this.worker.terminate()
      this.worker = undefined
    }

    // Clear any pending extraction timeout
    if (this.extractionTimeoutId) {
      clearTimeout(this.extractionTimeoutId)
      this.extractionTimeoutId = undefined
    }

    // Clean up video element if we created it
    if (this.videoElement && !document.body.contains(this.videoElement)) {
      document.body.removeChild(this.videoElement)
    }
    this.videoElement = undefined
    this.canvas = undefined
    this.ctx = undefined
    this.results = []
    this.isExtractionPaused = false
  }

  dispose() {
    this.stop()
  }

  // Method to process a single frame (called by external frame extraction)
  processFrame(frameData: ImageData | ImageBitmap, timestamp: number) {
    if (!this.worker || this.isExtractionPaused) return

    this.worker.postMessage({
      type: 'processSceneFrame',
      payload: {
        frameData,
        timestamp
      }
    })
  }

  // Get current results
  getResults(): SceneChangeResult[] {
    return this.results.slice()
  }
}

export function runSceneDetection(
  duration: number,
  callbacks: SceneChangeCallbacks,
  options: SceneChangeOptions = {}
): () => void {
  const controller = new SceneDetectionWorkerController()
  controller.start(duration, callbacks, options)
  return () => controller.dispose()
}
