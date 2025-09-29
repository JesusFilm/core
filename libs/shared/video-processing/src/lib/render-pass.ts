/**
 * Render pass implementation for auto-crop pipeline
 * Handles frame cropping, scaling, background fill, and encoding
 */

import type { CropPath, RenderingConfig, RenderingProgress, RenderingResult } from '../types/crop-path'
import type { VirtualCameraPath, VirtualCameraKeyframe } from '../types/virtual-camera'
import type { VideoMetadata } from '../types/video-metadata'
import { PathSerializer } from './virtual-camera'

/**
 * Input to render pass
 */
export interface RenderPassInput {
  /** Source video file or blob */
  sourceVideo: File | Blob | string
  /** Crop path to render */
  cropPath: CropPath | VirtualCameraPath
  /** Rendering configuration */
  config: RenderingConfig
  /** Source video metadata */
  metadata: VideoMetadata
}

/**
 * Render pass result
 */
export interface RenderPassResult {
  /** Rendering progress */
  progress: RenderingProgress
  /** Final result when complete */
  result?: RenderingResult
  /** Any errors encountered */
  error?: string
}

/**
 * Execute render pass to create cropped video
 */
export async function runRenderPass(
  input: RenderPassInput,
  onProgress?: (progress: RenderingProgress) => void
): Promise<RenderingResult> {
  const { sourceVideo, cropPath, config, metadata } = input

  // Convert to VirtualCameraPath if needed
  const virtualPath = isVirtualCameraPath(cropPath)
    ? cropPath
    : PathSerializer.deserializeCropPath(cropPath)

  // Initialize renderer
  const renderer = new VideoRenderer(config, metadata)

  // Initialize progress
  const progress: RenderingProgress = {
    stage: 'initializing',
    progress: 0,
    eta: 0,
    totalFrames: virtualPath.keyframes.length
  }

  onProgress?.(progress)

  try {
    // Load video for rendering
    progress.stage = 'probing'
    onProgress?.(progress)

    const videoElement = await loadVideoForRendering(sourceVideo)
    await validateVideoCompatibility(videoElement, metadata)

    // Initialize rendering context
    progress.stage = 'analyzing'
    onProgress?.(progress)

    await renderer.initialize(videoElement)

    // Render frames
    progress.stage = 'rendering'
    const startTime = performance.now()

    const renderedFrames = await renderer.renderFrames(virtualPath, (currentFrame, totalFrames) => {
      progress.progress = (currentFrame / totalFrames) * 100
      progress.currentFrame = currentFrame
      progress.totalFrames = totalFrames
      progress.fps = currentFrame / ((performance.now() - startTime) / 1000)
      progress.eta = ((totalFrames - currentFrame) / (progress.fps || 1)) / 60 // ETA in minutes
      progress.memoryUsage = (performance as any).memory?.usedJSHeapSize / (1024 * 1024) // MB

      onProgress?.(progress)
    })

    // Encode final video
    progress.stage = 'encoding'
    onProgress?.(progress)

    const result = await renderer.encodeVideo(renderedFrames, virtualPath)

    progress.stage = 'complete'
    progress.progress = 100
    onProgress?.(progress)

    return result

  } catch (error) {
    throw new Error(`Render pass failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Video renderer with canvas-based cropping and background fill
 */
class VideoRenderer {
  private canvas: OffscreenCanvas | null = null
  private ctx: OffscreenCanvasRenderingContext2D | null = null
  private video: HTMLVideoElement | null = null
  private config: RenderingConfig
  private metadata: VideoMetadata

  constructor(config: RenderingConfig, metadata: VideoMetadata) {
    this.config = config
    this.metadata = metadata
  }

  /**
   * Initialize rendering context
   */
  async initialize(videoElement: HTMLVideoElement): Promise<void> {
    this.video = videoElement

    // Create offscreen canvas for rendering
    this.canvas = new OffscreenCanvas(this.config.output.width, this.config.output.height)
    this.ctx = this.canvas.getContext('2d')

    if (!this.ctx) {
      throw new Error('Failed to get 2D rendering context')
    }

    // Configure canvas for high-quality rendering
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'
  }

  /**
   * Render all frames according to the crop path
   */
  async renderFrames(
    virtualPath: VirtualCameraPath,
    onFrameProgress?: (currentFrame: number, totalFrames: number) => void
  ): Promise<ImageData[]> {
    if (!this.video || !this.canvas || !this.ctx) {
      throw new Error('Renderer not initialized')
    }

    const frames: ImageData[] = []
    const frameDuration = 1 / this.config.output.fps

    for (let i = 0; i < virtualPath.keyframes.length; i++) {
      const keyframe = virtualPath.keyframes[i]

      // Seek to the correct time in the video
      this.video.currentTime = keyframe.t
      await waitForVideoSeek(this.video, keyframe.t)

      // Calculate crop coordinates in source video space
      const cropCoords = this.calculateCropCoordinates(keyframe)

      // Render the cropped frame
      const frameData = this.renderFrame(cropCoords, keyframe.t)
      frames.push(frameData)

      onFrameProgress?.(i + 1, virtualPath.keyframes.length)
    }

    return frames
  }

  /**
   * Calculate crop coordinates from keyframe
   */
  private calculateCropCoordinates(keyframe: VirtualCameraKeyframe): CropCoordinates {
    // Convert normalized coordinates back to source video pixel coordinates
    const sourceX = keyframe.cx * this.metadata.width - (keyframe.cw * this.metadata.width) / 2
    const sourceY = keyframe.cy * this.metadata.height - (keyframe.ch * this.metadata.height) / 2
    const sourceWidth = keyframe.cw * this.metadata.width
    const sourceHeight = keyframe.ch * this.metadata.height

    // Calculate target dimensions (9:16 aspect ratio, 1080x1920)
    const targetAspect = this.config.output.width / this.config.output.height // 1080/1920 = 9/16
    const sourceAspect = sourceWidth / sourceHeight

    let targetWidth = this.config.output.width
    let targetHeight = this.config.output.height

    // Scale to fit while maintaining aspect ratio
    if (sourceAspect > targetAspect) {
      // Source is wider than target - fit height
      targetHeight = this.config.output.height
      targetWidth = targetHeight * sourceAspect
    } else {
      // Source is taller than target - fit width
      targetWidth = this.config.output.width
      targetHeight = targetWidth / sourceAspect
    }

    return {
      sourceX: Math.max(0, sourceX),
      sourceY: Math.max(0, sourceY),
      sourceWidth: Math.min(this.metadata.width - sourceX, sourceWidth),
      sourceHeight: Math.min(this.metadata.height - sourceY, sourceHeight),
      targetX: (this.config.output.width - targetWidth) / 2,
      targetY: (this.config.output.height - targetHeight) / 2,
      targetWidth,
      targetHeight
    }
  }

  /**
   * Render a single frame with cropping and background fill
   */
  private renderFrame(cropCoords: CropCoordinates, timestamp: number): ImageData {
    if (!this.video || !this.canvas || !this.ctx) {
      throw new Error('Renderer not initialized')
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.config.output.width, this.config.output.height)

    // Apply background fill if needed
    if (this.config.background.strategy !== 'black') {
      this.applyBackgroundFill(cropCoords)
    }

    // Draw the cropped video frame
    this.ctx.drawImage(
      this.video,
      cropCoords.sourceX,
      cropCoords.sourceY,
      cropCoords.sourceWidth,
      cropCoords.sourceHeight,
      cropCoords.targetX,
      cropCoords.targetY,
      cropCoords.targetWidth,
      cropCoords.targetHeight
    )

    // Return the frame data
    return this.ctx.getImageData(0, 0, this.config.output.width, this.config.output.height)
  }

  /**
   * Apply background fill for undersized crops
   */
  private applyBackgroundFill(cropCoords: CropCoordinates): void {
    if (!this.ctx) return

    const { strategy, blurRadius = 10 } = this.config.background

    if (strategy === 'blur') {
      // Create blurred background from the cropped region
      this.ctx.save()

      // Draw blurred version of the source frame
      this.ctx.filter = `blur(${blurRadius}px)`
      this.ctx.globalAlpha = 0.3
      this.ctx.drawImage(
        this.video!,
        0, 0, this.metadata.width, this.metadata.height,
        0, 0, this.config.output.width, this.config.output.height
      )

      this.ctx.restore()
    } else if (strategy === 'extend') {
      // Extend edges of the cropped region
      const extendAmount = 20
      this.ctx.drawImage(
        this.video!,
        cropCoords.sourceX, cropCoords.sourceY, cropCoords.sourceWidth, cropCoords.sourceHeight,
        cropCoords.targetX - extendAmount, cropCoords.targetY - extendAmount,
        cropCoords.targetWidth + extendAmount * 2, cropCoords.targetHeight + extendAmount * 2
      )
    }
    // For 'black' strategy, we just leave the canvas cleared (black background)
  }

  /**
   * Encode rendered frames to final video format
   */
  async encodeVideo(
    frames: ImageData[],
    virtualPath: VirtualCameraPath
  ): Promise<RenderingResult> {
    // For now, return a mock result since actual encoding requires WebCodecs or ffmpeg.wasm
    // In a real implementation, this would use WebCodecs VideoEncoder or ffmpeg.wasm

    const startTime = performance.now()
    const processingTime = performance.now() - startTime

    // Calculate file size estimate (rough approximation)
    const bitsPerPixel = 24 // RGB
    const bytesPerFrame = (this.config.output.width * this.config.output.height * bitsPerPixel) / 8
    const compressionRatio = 0.1 // Assume 10:1 compression
    const estimatedFileSize = frames.length * bytesPerFrame * compressionRatio

    return {
      outputUrl: 'blob:mock-encoded-video', // Would be actual blob URL
      fileSize: estimatedFileSize,
      duration: virtualPath.metadata.duration,
      stats: {
        totalTime: processingTime,
        avgEncodingFps: frames.length / (processingTime / 1000),
        peakMemoryUsage: (performance as any).memory?.usedJSHeapSize / (1024 * 1024) || 0,
        quality: {
          psnr: 35.0, // Placeholder quality metrics
          ssim: 0.95
        }
      },
      warnings: [
        'Mock encoding implementation - actual WebCodecs/ffmpeg.wasm integration needed',
        'Background fill strategy may need optimization for performance'
      ]
    }
  }
}

/**
 * Load video element for rendering
 */
async function loadVideoForRendering(source: File | Blob | string): Promise<HTMLVideoElement> {
  const video = document.createElement('video')
  video.preload = 'auto'
  video.muted = true
  video.playsInline = true

  return new Promise((resolve, reject) => {
    video.onloadedmetadata = () => resolve(video)
    video.onerror = () => reject(new Error('Failed to load video for rendering'))

    if (typeof source === 'string') {
      video.src = source
    } else {
      video.src = URL.createObjectURL(source)
    }
  })
}

/**
 * Wait for video to seek to the specified time
 */
function waitForVideoSeek(video: HTMLVideoElement, targetTime: number, tolerance: number = 0.1): Promise<void> {
  return new Promise((resolve) => {
    const checkTime = () => {
      if (Math.abs(video.currentTime - targetTime) <= tolerance) {
        resolve()
      } else {
        requestAnimationFrame(checkTime)
      }
    }
    checkTime()
  })
}

/**
 * Validate video compatibility with rendering requirements
 */
async function validateVideoCompatibility(video: HTMLVideoElement, metadata: VideoMetadata): Promise<void> {
  if (video.videoWidth !== metadata.width || video.videoHeight !== metadata.height) {
    throw new Error(`Video dimensions mismatch: expected ${metadata.width}x${metadata.height}, got ${video.videoWidth}x${video.videoHeight}`)
  }

  // Check if video is seekable
  if (!video.seekable || video.seekable.length === 0) {
    throw new Error('Video is not seekable')
  }

  // Additional validation could include codec support, etc.
}

/**
 * Type guard for VirtualCameraPath
 */
function isVirtualCameraPath(path: any): path is VirtualCameraPath {
  return 'keyframes' in path && 'metadata' in path
}

/**
 * Crop coordinates for rendering
 */
interface CropCoordinates {
  sourceX: number
  sourceY: number
  sourceWidth: number
  sourceHeight: number
  targetX: number
  targetY: number
  targetWidth: number
  targetHeight: number
}
