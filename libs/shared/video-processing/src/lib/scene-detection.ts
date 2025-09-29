/**
 * Scene detection and shot boundary analysis for auto-crop pipeline
 */

import type {
  ShotBoundary,
  SceneDetectionConfig,
  SceneDetectionResults
} from '../types/scene-detection'
import type { VideoMetadata } from '../types/video-metadata'
import type { FrameMetadata } from '../types/decoding'
import { toShotTexture, cleanupDownscaledInputs } from './analysis/imageops'
import { gpuHistogramDiff, ssim160 } from './analysis/shot'

/**
 * Main function to detect shot boundaries in a video
 * Samples frames and analyzes differences to identify scene cuts
 */
export async function detectShots(
  videoElement: HTMLVideoElement,
  metadata: VideoMetadata,
  config: SceneDetectionConfig,
  onProgress?: (progress: { frame: number; totalFrames: number }) => void
): Promise<SceneDetectionResults> {
  const startTime = performance.now()
  const frameDifferences: number[] = []
  const frameProcessingTimes: number[] = []

  // Calculate total frames and sampling
  const totalFrames = Math.floor(metadata.duration * metadata.fps)
  const step = config.sampling.step
  const sampleFrames = Math.ceil(totalFrames / step)

  // Sample frames for analysis
  const sampledFrames: ImageData[] = []

  for (let i = 0; i < sampleFrames; i++) {
    const frameIndex = i * step
    const timestamp = frameIndex / metadata.fps

    if (timestamp > metadata.duration) break

    const frameStart = performance.now()

    try {
      // Seek to timestamp
      videoElement.currentTime = timestamp

      // Wait for seek to complete
      await waitForSeek(videoElement)

      // Capture frame
      const frameData = captureVideoFrame(videoElement, config)
      sampledFrames.push(frameData)

      const frameTime = performance.now() - frameStart
      frameProcessingTimes.push(frameTime)

      onProgress?.({ frame: i + 1, totalFrames: sampleFrames })
    } catch (error) {
      console.warn(`Failed to process frame at ${timestamp}s:`, error)
      // Continue with next frame
    }
  }

  // Calculate differences between consecutive frames
  for (let i = 1; i < sampledFrames.length; i++) {
    const diff = calculateFrameDifference(
      sampledFrames[i - 1],
      sampledFrames[i],
      config
    )
    frameDifferences.push(diff)
  }

  // Apply temporal smoothing if enabled
  let smoothedDifferences = frameDifferences
  if (config.processing.temporalSmoothing) {
    smoothedDifferences = applyTemporalSmoothing(
      frameDifferences,
      config.processing.temporalWindow
    )
  }

  // Detect shot boundaries
  const shots = extractShotBoundaries(
    smoothedDifferences,
    metadata,
    config,
    step
  )

  const processingTime = performance.now() - startTime

  return {
    shots,
    stats: {
      framesProcessed: sampledFrames.length,
      processingTime,
      avgProcessingTimePerFrame: processingTime / sampledFrames.length,
      totalShots: shots.length,
      avgShotDuration: shots.length > 0 ? metadata.duration / shots.length : 0,
      shotDurationVariance: calculateShotDurationVariance(shots)
    },
    config,
    debug: config.performance.useWebGL ? undefined : {
      frameDifferences: smoothedDifferences,
      frameProcessingTimes
    }
  }
}

/**
 * Detect shot boundaries from a VideoFrame stream (WebCodecs optimization)
 * Uses downscaled OffscreenCanvas textures to eliminate getImageData calls
 */
export async function detectShotsFromVideoStream(
  frameStream: AsyncIterable<{ frame: VideoFrame; metadata: FrameMetadata }>,
  metadata: VideoMetadata,
  config: SceneDetectionConfig,
  onProgress?: (progress: { frame: number; totalFrames: number }) => void
): Promise<SceneDetectionResults> {
  const startTime = performance.now()
  const frameTextures: OffscreenCanvas[] = []
  const frameProcessingTimes: number[] = []

  // Calculate sampling parameters
  const totalFrames = Math.floor(metadata.duration * metadata.fps)
  const step = config.sampling.step
  const sampleFrames = Math.ceil(totalFrames / step)

  let processedFrameCount = 0

  // Sample frames from the stream
  for await (const { frame, metadata: frameMetadata } of frameStream) {
    const frameIndex = frameMetadata.frameIndex
    const timestamp = frameMetadata.timestamp / 1000000 // Convert to seconds

    // Only process every Nth frame based on sampling step
    if (frameIndex % step !== 0) {
      frame.close()
      continue
    }

    const frameStart = performance.now()

    try {
      // Create downscaled texture for shot detection (~160p)
      const shotTexture = toShotTexture(frame)
      frameTextures.push(shotTexture)

      const frameTime = performance.now() - frameStart
      frameProcessingTimes.push(frameTime)

      processedFrameCount++
      onProgress?.({ frame: processedFrameCount, totalFrames: sampleFrames })

      // Stop if we've processed all expected frames
      if (processedFrameCount >= sampleFrames) {
        break
      }
    } catch (error) {
      console.warn(`Failed to process frame at ${timestamp}s:`, error)
    } finally {
      frame.close()
    }
  }

  // Calculate differences between consecutive textures
  const frameDifferences: number[] = []
  for (let i = 1; i < frameTextures.length; i++) {
    const diff = calculateTextureDifference(
      frameTextures[i - 1],
      frameTextures[i],
      config
    )
    frameDifferences.push(diff)
  }

  // Apply temporal smoothing if enabled
  let smoothedDifferences = frameDifferences
  if (config.processing.temporalSmoothing) {
    smoothedDifferences = applyTemporalSmoothing(
      frameDifferences,
      config.processing.temporalWindow
    )
  }

  // Detect shot boundaries
  const shots = extractShotBoundaries(
    smoothedDifferences,
    metadata,
    config,
    step
  )

  const processingTime = performance.now() - startTime

  // Clean up textures
  frameTextures.forEach(texture => {
    // OffscreenCanvas doesn't need explicit cleanup
  })

  return {
    shots,
    stats: {
      framesProcessed: frameTextures.length,
      processingTime,
      avgProcessingTimePerFrame: processingTime / frameTextures.length,
      totalShots: shots.length,
      avgShotDuration: shots.length > 0 ? metadata.duration / shots.length : 0,
      shotDurationVariance: calculateShotDurationVariance(shots)
    },
    config,
    debug: config.performance.useWebGL ? undefined : {
      frameDifferences: smoothedDifferences,
      frameProcessingTimes
    }
  }
}

/**
 * Calculate frame difference using OffscreenCanvas textures (no getImageData)
 */
function calculateTextureDifference(
  texture1: OffscreenCanvas,
  texture2: OffscreenCanvas,
  config: SceneDetectionConfig
): number {
  // For now, convert to ImageData for compatibility with existing algorithms
  // TODO: Implement GPU-accelerated histogram/SSIM on OffscreenCanvas
  const imageData1 = textureToImageData(texture1)
  const imageData2 = textureToImageData(texture2)

  return calculateFrameDifference(imageData1, imageData2, config)
}

/**
 * Convert OffscreenCanvas texture to ImageData
 */
function textureToImageData(texture: OffscreenCanvas): ImageData {
  const ctx = texture.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get OffscreenCanvas context')
  }
  return ctx.getImageData(0, 0, texture.width, texture.height)
}

/**
 * Capture a video frame as ImageData for analysis
 */
function captureVideoFrame(
  videoElement: HTMLVideoElement,
  config: SceneDetectionConfig
): ImageData {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context for frame capture')
  }

  // Apply downsampling for performance
  const downsampleFactor = config.performance.downsampleFactor
  canvas.width = Math.floor(videoElement.videoWidth / downsampleFactor)
  canvas.height = Math.floor(videoElement.videoHeight / downsampleFactor)

  // Draw and scale the frame
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

  // Apply blur for noise reduction if specified
  if (config.processing.blurKernel > 1) {
    applyBlur(ctx, canvas.width, canvas.height, config.processing.blurKernel)
  }

  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

/**
 * Apply Gaussian blur to reduce noise
 */
function applyBlur(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  kernelSize: number
): void {
  // Simple box blur approximation
  const imageData = ctx.getImageData(0, 0, width, height)
  const blurred = new ImageData(width, height)

  const radius = Math.floor(kernelSize / 2)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0
      let count = 0

      // Sample neighboring pixels
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.max(0, Math.min(width - 1, x + dx))
          const ny = Math.max(0, Math.min(height - 1, y + dy))

          const index = (ny * width + nx) * 4
          r += imageData.data[index]
          g += imageData.data[index + 1]
          b += imageData.data[index + 2]
          a += imageData.data[index + 3]
          count++
        }
      }

      const index = (y * width + x) * 4
      blurred.data[index] = r / count
      blurred.data[index + 1] = g / count
      blurred.data[index + 2] = b / count
      blurred.data[index + 3] = a / count
    }
  }

  ctx.putImageData(blurred, 0, 0)
}

/**
 * Calculate difference between two frames using histogram and SSIM
 */
function calculateFrameDifference(
  frame1: ImageData,
  frame2: ImageData,
  config: SceneDetectionConfig
): number {
  // Calculate histogram difference
  const histDiff = calculateHistogramDifference(frame1, frame2, config)

  // Calculate SSIM difference
  const ssimDiff = calculateSSIMDifference(frame1, frame2)

  // Combine metrics based on thresholds
  const histWeight = config.thresholds.histogram > 0 ? 0.6 : 0
  const ssimWeight = config.thresholds.ssim > 0 ? 0.4 : 0

  if (histWeight + ssimWeight === 0) {
    return 0
  }

  const combinedDiff = (histDiff * histWeight + (1 - ssimDiff) * ssimWeight) / (histWeight + ssimWeight)

  return combinedDiff
}

/**
 * Calculate histogram difference between two frames
 */
function calculateHistogramDifference(
  frame1: ImageData,
  frame2: ImageData,
  config: SceneDetectionConfig
): number {
  const bins = config.processing.histogramBins
  const hist1 = calculateHistogram(frame1, bins)
  const hist2 = calculateHistogram(frame2, bins)

  let totalDiff = 0

  // Compare histograms for each channel
  for (let c = 0; c < 3; c++) { // RGB channels
    for (let b = 0; b < bins; b++) {
      const diff = Math.abs(hist1[c][b] - hist2[c][b])
      totalDiff += diff
    }
  }

  // Normalize difference
  return Math.min(totalDiff / (3 * bins), 1)
}

/**
 * Calculate histogram for an image
 */
function calculateHistogram(imageData: ImageData, bins: number): number[][] {
  const { data, width, height } = imageData
  const histograms = Array.from({ length: 3 }, () => new Array(bins).fill(0))
  const totalPixels = width * height

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Skip alpha channel
    const binSize = 256 / bins

    histograms[0][Math.floor(r / binSize)]++
    histograms[1][Math.floor(g / binSize)]++
    histograms[2][Math.floor(b / binSize)]++
  }

  // Normalize histograms
  for (let c = 0; c < 3; c++) {
    for (let b = 0; b < bins; b++) {
      histograms[c][b] /= totalPixels
    }
  }

  return histograms
}

/**
 * Calculate SSIM difference between two frames
 */
function calculateSSIMDifference(frame1: ImageData, frame2: ImageData): number {
  const { data: data1, width, height } = frame1
  const { data: data2 } = frame2

  // Constants for SSIM calculation
  const C1 = (0.01 * 255) ** 2
  const C2 = (0.03 * 255) ** 2

  let ssimSum = 0
  const windowSize = 8
  const numWindows = Math.floor(width / windowSize) * Math.floor(height / windowSize)

  // Calculate SSIM over sliding windows
  for (let wy = 0; wy < height - windowSize; wy += windowSize) {
    for (let wx = 0; wx < width - windowSize; wx += windowSize) {
      const window1 = extractWindow(data1, width, wx, wy, windowSize)
      const window2 = extractWindow(data2, width, wx, wy, windowSize)

      const stats1 = calculateWindowStats(window1)
      const stats2 = calculateWindowStats(window2)

      const ssim = calculateSSIM(stats1, stats2, C1, C2)
      ssimSum += ssim
    }
  }

  return ssimSum / Math.max(numWindows, 1)
}

/**
 * Extract a window of pixels from image data
 */
function extractWindow(
  data: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
  size: number
): number[] {
  const window: number[] = []

  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const pixelX = x + dx
      const pixelY = y + dy
      const index = (pixelY * width + pixelX) * 4

      // Convert RGB to luminance
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b

      window.push(luminance)
    }
  }

  return window
}

/**
 * Calculate statistics for a window of pixels
 */
function calculateWindowStats(window: number[]): { mean: number; variance: number } {
  const sum = window.reduce((a, b) => a + b, 0)
  const mean = sum / window.length

  const variance = window.reduce((sum, val) => sum + (val - mean) ** 2, 0) / window.length

  return { mean, variance }
}

/**
 * Calculate SSIM for two windows
 */
function calculateSSIM(
  stats1: { mean: number; variance: number },
  stats2: { mean: number; variance: number },
  C1: number,
  C2: number
): number {
  const { mean: mu1, variance: sigma1Sq } = stats1
  const { mean: mu2, variance: sigma2Sq } = stats2

  const sigma12 = calculateCovariance(stats1, stats2)

  const numerator = (2 * mu1 * mu2 + C1) * (2 * sigma12 + C2)
  const denominator = (mu1 ** 2 + mu2 ** 2 + C1) * (sigma1Sq + sigma2Sq + C2)

  return numerator / denominator
}

/**
 * Calculate covariance between two windows (simplified)
 */
function calculateCovariance(
  stats1: { mean: number; variance: number },
  stats2: { mean: number; variance: number }
): number {
  // This is a simplified calculation - in practice you'd need the actual pixel values
  // For performance, we use a heuristic based on variances
  return Math.sqrt(stats1.variance * stats2.variance)
}

/**
 * Apply temporal smoothing to frame differences
 */
function applyTemporalSmoothing(differences: number[], windowSize: number): number[] {
  const smoothed: number[] = []

  for (let i = 0; i < differences.length; i++) {
    let sum = 0
    let count = 0

    const start = Math.max(0, i - Math.floor(windowSize / 2))
    const end = Math.min(differences.length, i + Math.floor(windowSize / 2) + 1)

    for (let j = start; j < end; j++) {
      sum += differences[j]
      count++
    }

    smoothed.push(sum / count)
  }

  return smoothed
}

/**
 * Extract shot boundaries from frame differences
 */
function extractShotBoundaries(
  differences: number[],
  metadata: VideoMetadata,
  config: SceneDetectionConfig,
  step: number
): ShotBoundary[] {
  const shots: ShotBoundary[] = []
  const fps = metadata.fps

  let currentShotStart = 0

  for (let i = 0; i < differences.length; i++) {
    const frameIndex = (i + 1) * step // +1 because differences start from frame 1
    const timestamp = frameIndex / fps

    // Check if this is a shot boundary
    const isBoundary = checkBoundaryCondition(differences[i], config.thresholds)

    if (isBoundary) {
      // Create shot boundary
      const shot: ShotBoundary = {
        startFrame: currentShotStart,
        endFrame: frameIndex - 1, // End at frame before boundary
        startTime: currentShotStart / fps,
        endTime: (frameIndex - 1) / fps,
        duration: (frameIndex - 1 - currentShotStart) / fps,
        confidence: differences[i],
        method: getBoundaryMethod(differences[i], config.thresholds),
        metadata: {
          histogramDiff: calculateHistogramContribution(differences[i], config),
          ssimScore: calculateSSIMContribution(differences[i], config),
          processingTime: 0 // Would be populated if we tracked per-boundary timing
        }
      }

      shots.push(shot)
      currentShotStart = frameIndex
    }
  }

  // Add final shot
  if (currentShotStart < Math.floor(metadata.duration * fps)) {
    const finalFrame = Math.floor(metadata.duration * fps) - 1
    const shot: ShotBoundary = {
      startFrame: currentShotStart,
      endFrame: finalFrame,
      startTime: currentShotStart / fps,
      endTime: metadata.duration,
      duration: metadata.duration - (currentShotStart / fps),
      confidence: 0,
      method: 'final',
      metadata: {}
    }
    shots.push(shot)
  }

  return shots
}

/**
 * Check if a difference value indicates a shot boundary
 */
function checkBoundaryCondition(diff: number, thresholds: SceneDetectionConfig['thresholds']): boolean {
  // Check individual thresholds
  const histBoundary = thresholds.histogram > 0 && diff > thresholds.histogram
  const ssimBoundary = thresholds.ssim > 0 && diff > (1 - thresholds.ssim)
  const edgeBoundary = thresholds.edge > 0 && diff > thresholds.edge

  // Combined threshold
  const combinedBoundary = diff > thresholds.combined

  return combinedBoundary || histBoundary || ssimBoundary || edgeBoundary
}

/**
 * Determine which method detected the boundary
 */
function getBoundaryMethod(
  diff: number,
  thresholds: SceneDetectionConfig['thresholds']
): ShotBoundary['method'] {
  if (diff > thresholds.combined) return 'combined'
  if (diff > thresholds.histogram) return 'histogram'
  if (diff > (1 - thresholds.ssim)) return 'ssim'
  if (diff > thresholds.edge) return 'edge_difference'
  return 'combined'
}

/**
 * Calculate histogram contribution to difference
 */
function calculateHistogramContribution(diff: number, config: SceneDetectionConfig): number {
  // This is a simplified calculation - in practice you'd track individual contributions
  return Math.min(diff, config.thresholds.histogram)
}

/**
 * Calculate SSIM contribution to difference
 */
function calculateSSIMContribution(diff: number, config: SceneDetectionConfig): number {
  // This is a simplified calculation - in practice you'd track individual contributions
  return Math.max(0, 1 - diff / config.thresholds.ssim)
}

/**
 * Calculate variance in shot durations
 */
function calculateShotDurationVariance(shots: ShotBoundary[]): number {
  if (shots.length <= 1) return 0

  const durations = shots.map(shot => shot.duration)
  const mean = durations.reduce((a, b) => a + b, 0) / durations.length

  const variance = durations.reduce((sum, duration) => sum + (duration - mean) ** 2, 0) / durations.length

  return variance
}

/**
 * Detect shot boundaries using histogram-gated SSIM optimization
 * Only computes expensive SSIM when histogram difference is in the gating range
 */
export async function detectShotsFromVideoStreamGated(
  frameStream: AsyncIterable<{ frame: VideoFrame; metadata: FrameMetadata }>,
  metadata: VideoMetadata,
  config: SceneDetectionConfig,
  onProgress?: (progress: { frame: number; totalFrames: number }) => void
): Promise<SceneDetectionResults> {
  const startTime = performance.now()

  // Calculate sampling parameters
  const totalFrames = Math.floor(metadata.duration * metadata.fps)
  const step = config.sampling.step
  const sampleFrames = Math.ceil(totalFrames / step)

  let processedFrameCount = 0
  const frameTextures: OffscreenCanvas[] = []
  const frameProcessingTimes: number[] = []

  // Gating statistics
  let totalComparisons = 0
  let ssimSkippedLow = 0
  let cutsWithoutSsim = 0
  let ssimComputed = 0

  // Buffer for temporal debounce
  const debounceBuffer: Array<{
    frameIndex: number
    histogramScore: number
    isBoundary: boolean
    ssimScore?: number
  }> = []

  const gatingConfig = config.thresholds.gating

  // Sample frames from the stream
  for await (const { frame, metadata: frameMetadata } of frameStream) {
    const frameIndex = frameMetadata.frameIndex
    const timestamp = frameMetadata.timestamp / 1000000 // Convert to seconds

    // Only process every Nth frame based on sampling step
    if (frameIndex % step !== 0) {
      frame.close()
      continue
    }

    const frameStart = performance.now()

    try {
      // Create downscaled texture for shot detection (~160p)
      const shotTexture = toShotTexture(frame)
      frameTextures.push(shotTexture)

      const frameTime = performance.now() - frameStart
      frameProcessingTimes.push(frameTime)

      processedFrameCount++
      onProgress?.({ frame: processedFrameCount, totalFrames: sampleFrames })

      // Stop if we've processed all expected frames
      if (processedFrameCount >= sampleFrames) {
        break
      }
    } catch (error) {
      console.warn(`Failed to process frame at ${timestamp}s:`, error)
    } finally {
      frame.close()
    }
  }

  // Process frame pairs for shot detection with histogram gating
  const frameDifferences: number[] = []

  for (let i = 1; i < frameTextures.length; i++) {
    const texPrev = frameTextures[i - 1]
    const texCurr = frameTextures[i]

    // Calculate histogram difference (cheap operation)
    const histResult = await gpuHistogramDiff(texPrev, texCurr)
    const histogramScore = histResult.score
    totalComparisons++

    let isBoundary = false
    let ssimScore: number | undefined
    let gatingReason: 'below_low_threshold' | 'above_high_threshold' | 'in_range'

    // Apply histogram gating logic
    if (gatingConfig && histogramScore <= gatingConfig.lowThreshold) {
      // Below low threshold: no cut, skip SSIM
      isBoundary = false
      ssimSkippedLow++
      gatingReason = 'below_low_threshold'
    } else if (gatingConfig && histogramScore >= gatingConfig.highThreshold) {
      // Above high threshold: mark cut without SSIM
      isBoundary = true
      cutsWithoutSsim++
      gatingReason = 'above_high_threshold'
    } else {
      // In range: compute SSIM for final decision
      ssimScore = await ssim160(texPrev, texCurr)
      ssimComputed++

      // Use SSIM for boundary decision
      const ssimThreshold = 1 - config.thresholds.ssim // Convert to difference threshold
      isBoundary = ssimScore < config.thresholds.ssim // Lower SSIM indicates more difference
      gatingReason = 'in_range'
    }

    // Add to debounce buffer
    debounceBuffer.push({
      frameIndex: i,
      histogramScore,
      isBoundary,
      ssimScore
    })

    // Apply temporal debounce if configured
    if (gatingConfig && debounceBuffer.length >= gatingConfig.temporalDebounce) {
      const debouncedBoundary = applyTemporalDebounce(debounceBuffer, gatingConfig.temporalDebounce)
      frameDifferences.push(debouncedBoundary ? 1 : 0)
    }
  }

  // Extract shot boundaries from the debounced differences
  const shots = extractShotBoundariesGated(
    debounceBuffer,
    metadata,
    config,
    step
  )

  const processingTime = performance.now() - startTime

  // Clean up textures
  frameTextures.forEach(texture => {
    // OffscreenCanvas doesn't need explicit cleanup
  })

  const ssimComputeRate = totalComparisons > 0 ? (ssimComputed / totalComparisons) * 100 : 0

  return {
    shots,
    stats: {
      framesProcessed: frameTextures.length,
      processingTime,
      avgProcessingTimePerFrame: processingTime / frameTextures.length,
      totalShots: shots.length,
      avgShotDuration: shots.length > 0 ? metadata.duration / shots.length : 0,
      shotDurationVariance: calculateShotDurationVariance(shots),
      gatingStats: {
        totalComparisons,
        ssimSkippedLow,
        cutsWithoutSsim,
        ssimComputed,
        ssimComputeRate
      }
    },
    config,
    debug: config.performance.useWebGL ? undefined : {
      frameDifferences,
      frameProcessingTimes
    }
  }
}

/**
 * Apply temporal debounce to boundary decisions
 */
function applyTemporalDebounce(
  buffer: Array<{ isBoundary: boolean }>,
  debounceWindow: number
): boolean {
  if (buffer.length < debounceWindow) {
    return false
  }

  // Check if majority of recent frames indicate a boundary
  let boundaryCount = 0
  for (let i = buffer.length - debounceWindow; i < buffer.length; i++) {
    if (buffer[i].isBoundary) {
      boundaryCount++
    }
  }

  return boundaryCount >= Math.ceil(debounceWindow / 2)
}

/**
 * Extract shot boundaries with gating metadata
 */
function extractShotBoundariesGated(
  buffer: Array<{
    frameIndex: number
    histogramScore: number
    isBoundary: boolean
    ssimScore?: number
  }>,
  metadata: VideoMetadata,
  config: SceneDetectionConfig,
  step: number
): ShotBoundary[] {
  const shots: ShotBoundary[] = []
  const fps = metadata.fps

  let currentShotStart = 0

  for (let i = 0; i < buffer.length; i++) {
    const frameData = buffer[i]
    const frameIndex = (frameData.frameIndex + 1) * step // +1 because differences start from frame 1
    const timestamp = frameIndex / fps

    if (frameData.isBoundary) {
      // Create shot boundary
      const shot: ShotBoundary = {
        startFrame: currentShotStart,
        endFrame: frameIndex - 1, // End at frame before boundary
        startTime: currentShotStart / fps,
        endTime: (frameIndex - 1) / fps,
        duration: (frameIndex - 1 - currentShotStart) / fps,
        confidence: frameData.histogramScore,
        method: 'histogram_gated',
        metadata: {
          histogramDiff: frameData.histogramScore,
          ssimScore: frameData.ssimScore,
          processingTime: 0, // Would be populated if we tracked per-boundary timing
          gating: {
            histogramScore: frameData.histogramScore,
            ssimComputed: frameData.ssimScore !== undefined,
            gatingReason: frameData.ssimScore !== undefined ? 'in_range' :
                        frameData.isBoundary ? 'above_high_threshold' : 'below_low_threshold'
          }
        }
      }

      shots.push(shot)
      currentShotStart = frameIndex
    }
  }

  // Add final shot
  if (currentShotStart < Math.floor(metadata.duration * fps)) {
    const finalFrame = Math.floor(metadata.duration * fps) - 1
    const shot: ShotBoundary = {
      startFrame: currentShotStart,
      endFrame: finalFrame,
      startTime: currentShotStart / fps,
      endTime: metadata.duration,
      duration: metadata.duration - (currentShotStart / fps),
      confidence: 0,
      method: 'final',
      metadata: {}
    }
    shots.push(shot)
  }

  return shots
}

/**
 * Wait for video seek to complete
 */
function waitForSeek(videoElement: HTMLVideoElement): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      videoElement.removeEventListener('seeked', onSeeked)
      resolve()
    }

    videoElement.addEventListener('seeked', onSeeked)

    // Timeout fallback
    setTimeout(() => {
      videoElement.removeEventListener('seeked', onSeeked)
      resolve()
    }, 2000)
  })
}
