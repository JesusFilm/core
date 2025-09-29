/**
 * Image operations for downscaling and GPU-accelerated processing
 * Eliminates getImageData calls by using ImageBitmap and OffscreenCanvas textures
 */

export interface DownscaledInputs {
  detectorBitmap: ImageBitmap | null
  shotTexture: OffscreenCanvas | null
}

/**
 * Downscale VideoFrame to detector-sized ImageBitmap (320-360px short side)
 * Uses createImageBitmap for zero-copy GPU acceleration
 */
export async function toDetectorBitmap(frame: VideoFrame): Promise<ImageBitmap> {
  const { displayWidth, displayHeight } = frame

  // Calculate target dimensions (short side 320-360px)
  const aspectRatio = displayWidth / displayHeight
  let targetWidth: number
  let targetHeight: number

  if (displayWidth < displayHeight) {
    // Portrait/vertical video
    targetWidth = Math.min(360, Math.max(320, displayWidth))
    targetHeight = targetWidth / aspectRatio
  } else {
    // Landscape/horizontal video
    targetHeight = Math.min(360, Math.max(320, displayHeight))
    targetWidth = targetHeight * aspectRatio
  }

  // Use createImageBitmap for GPU-accelerated downscaling
  // This is zero-copy on GPU and produces transferable ImageBitmap
  const bitmap = await createImageBitmap(frame, {
    resizeWidth: Math.round(targetWidth),
    resizeHeight: Math.round(targetHeight),
    resizeQuality: 'high'
  })

  return bitmap
}

/**
 * Downscale VideoFrame to shot detection texture (~160p)
 * Uses OffscreenCanvas for WebGL texture creation
 */
export function toShotTexture(frame: VideoFrame): OffscreenCanvas {
  const { displayWidth, displayHeight } = frame

  // Target ~160p (short side around 160px)
  const aspectRatio = displayWidth / displayHeight
  let targetWidth: number
  let targetHeight: number

  if (displayWidth < displayHeight) {
    // Portrait/vertical video
    targetWidth = 160
    targetHeight = Math.round(targetWidth / aspectRatio)
  } else {
    // Landscape/horizontal video
    targetHeight = 160
    targetWidth = Math.round(targetHeight * aspectRatio)
  }

  // Create OffscreenCanvas for WebGL texture
  const canvas = new OffscreenCanvas(targetWidth, targetHeight)
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get OffscreenCanvas 2D context for shot texture')
  }

  // Draw and downscale VideoFrame
  ctx.drawImage(frame as any, 0, 0, targetWidth, targetHeight)

  return canvas
}

/**
 * Create downscaled inputs for both detector and shot detection
 * Single pass through VideoFrame to create both scaled versions
 */
export async function createDownscaledInputs(frame: VideoFrame): Promise<DownscaledInputs> {
  // Create both downscaled versions in parallel for efficiency
  const [detectorBitmap, shotTexture] = await Promise.all([
    toDetectorBitmap(frame),
    Promise.resolve(toShotTexture(frame))
  ])

  return {
    detectorBitmap,
    shotTexture
  }
}

/**
 * Convert ImageBitmap to ImageData (for legacy detector compatibility)
 * Only use when detector doesn't support ImageBitmap directly
 */
export function bitmapToImageData(bitmap: ImageBitmap): ImageData {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get OffscreenCanvas context')
  }

  ctx.drawImage(bitmap, 0, 0)
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height)
}

/**
 * Clean up downscaled inputs to free memory
 */
export function cleanupDownscaledInputs(inputs: DownscaledInputs): void {
  if (inputs.detectorBitmap) {
    inputs.detectorBitmap.close()
  }
  // OffscreenCanvas doesn't need explicit cleanup
}
