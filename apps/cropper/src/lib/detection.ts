import type { DetectionResult, DetectionWorkerMessage } from '../types'

export interface DetectionCallbacks {
  onChunk?: (result: DetectionResult) => void
  onComplete?: (results: DetectionResult[]) => void
  onError?: (error: string) => void
}

export interface DetectionOptions {
  videoUrl?: string
  videoElement?: HTMLVideoElement
  frameRate?: number
  // New option to use existing video element instead of creating one
  useExistingElement?: boolean
}

export class DetectionWorkerController {
  private worker?: Worker
  private results: DetectionResult[] = []
  private videoElement?: HTMLVideoElement
  private canvas?: OffscreenCanvas
  private ctx?: OffscreenCanvasRenderingContext2D
  private isExtractionPaused: boolean = false
  private extractionTimeoutId?: number

  start(duration: number, callbacks: DetectionCallbacks, options: DetectionOptions = {}) {
    if (typeof window === 'undefined') {
      return
    }

    this.stop()
    this.results = []
    this.isExtractionPaused = false

    // Setup video element for frame extraction
    this.setupVideoElement(options)

    this.worker = new Worker(new URL('../workers/detection.worker.ts', import.meta.url), {
      type: 'module'
    })

    this.worker.onmessage = (event: MessageEvent<DetectionWorkerMessage>) => {
      const message = event.data

      if (message.type === 'chunk') {
        this.results.push(message.result)
        callbacks.onChunk?.(message.result)
        return
      }

      if (message.type === 'complete') {
        this.results = message.results
        callbacks.onComplete?.(message.results)
        return
      }

      if (message.type === 'error') {
        callbacks.onError?.(message.error)
      }

    }

    this.worker.onerror = (event) => {
      callbacks.onError?.(event.message)
    }

    // Start detection with video processing
    this.startVideoProcessing(duration, options, callbacks)
  }

  private setupVideoElement(options: DetectionOptions) {
    if (options.videoElement) {
      this.videoElement = options.videoElement

      // For existing elements, we might not have dimensions yet
      // Set up a basic canvas that will be resized when video loads
      this.canvas = new OffscreenCanvas(1920, 1080)
      this.ctx = this.canvas.getContext('2d') || undefined
    } else if (options.videoUrl) {
      this.videoElement = document.createElement('video')
      this.videoElement.src = options.videoUrl
      this.videoElement.crossOrigin = 'anonymous'
      this.videoElement.preload = 'metadata'
      this.videoElement.style.display = 'none'
      document.body.appendChild(this.videoElement)

      // Setup canvas for frame extraction
      this.canvas = new OffscreenCanvas(1920, 1080) // Will be resized when video loads
      this.ctx = this.canvas.getContext('2d') || undefined
    }
  }

  private async startVideoProcessing(duration: number, options: DetectionOptions, callbacks: DetectionCallbacks) {
    if (!this.worker || !this.videoElement) {
      // Fallback to mock processing if no video available
      this.worker?.postMessage({
        type: 'start',
        payload: {
          duration,
          frameRate: options.frameRate || 2
        }
      })
      return
    }

    try {
      // Wait for video metadata to load
      if (this.videoElement.readyState < 1) {
        await new Promise<void>((resolve, reject) => {
          const onLoadedMetadata = () => {
            this.videoElement?.removeEventListener('loadedmetadata', onLoadedMetadata)
            this.videoElement?.removeEventListener('error', onError)
            resolve()
          }
          const onError = (error: Event) => {
            this.videoElement?.removeEventListener('loadedmetadata', onLoadedMetadata)
            this.videoElement?.removeEventListener('error', onError)
            reject(error)
          }
          this.videoElement?.addEventListener('loadedmetadata', onLoadedMetadata)
          this.videoElement?.addEventListener('error', onError)
        })
      }

      // Update canvas size to match video
      if (this.canvas && this.ctx && this.videoElement.videoWidth && this.videoElement.videoHeight) {
        this.canvas.width = this.videoElement.videoWidth
        this.canvas.height = this.videoElement.videoHeight
      }

      // Start the worker
      this.worker.postMessage({
        type: 'start',
        payload: {
          duration,
          frameRate: options.frameRate || 2
        }
      })

    // Start frame extraction
    this.startFrameExtraction(duration, options.frameRate || 8, callbacks)

    } catch (error) {
      callbacks.onError?.(`Video processing setup failed: ${error}`)
    }
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

  private startFrameExtraction(duration: number, frameRate: number, callbacks: DetectionCallbacks) {
    if (!this.videoElement || !this.canvas || !this.ctx || !this.worker) {
      return
    }

    const interval = 1000 / frameRate
    const totalFrames = Math.ceil(duration * frameRate)
    let frameIndex = 0

    const extractFrame = () => {
      if (frameIndex >= totalFrames || !this.videoElement || !this.worker) {
        // Send completion signal
        this.worker?.postMessage({ type: 'terminate' })
        return
      }

      // If extraction is paused, wait and try again
      if (this.isExtractionPaused) {
        this.extractionTimeoutId = window.setTimeout(extractFrame, interval)
        return
      }

      const timestamp = (frameIndex / frameRate)

      try {
        // Seek to the timestamp
        this.videoElement.currentTime = timestamp

        // Wait for seek to complete and extract frame
        const onSeeked = () => {
          this.videoElement?.removeEventListener('seeked', onSeeked)

          try {
            // Draw video frame to canvas
            if (this.ctx && this.videoElement && this.canvas) {
              this.ctx.drawImage(this.videoElement, 0, 0)

              // Get image data
              const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)

              if (imageData && this.worker) {
                // Send frame to worker for processing
                this.worker.postMessage({
                  type: 'processFrame',
                  payload: {
                    frameData: imageData,
                    timestamp
                  }
                })
              }
            }
          } catch (error) {
            callbacks.onError?.(`Frame extraction failed: ${error}`)
          }

          frameIndex++
          this.extractionTimeoutId = window.setTimeout(extractFrame, interval)
        }

        this.videoElement.addEventListener('seeked', onSeeked)

      } catch (error) {
        callbacks.onError?.(`Frame extraction setup failed: ${error}`)
        frameIndex++
        this.extractionTimeoutId = window.setTimeout(extractFrame, interval)
      }
    }

    // Start extraction
    extractFrame()
  }

  stop() {
    if (this.worker) {
      this.worker.postMessage({ type: 'terminate' })
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
}

export function runDetection(
  duration: number,
  callbacks: DetectionCallbacks,
  options: DetectionOptions = {}
): () => void {
  const controller = new DetectionWorkerController()
  controller.start(duration, callbacks, options)
  return () => controller.dispose()
}
