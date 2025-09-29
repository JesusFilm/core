/**
 * GPU-accelerated shot boundary detection with histogram-gated SSIM
 * Implements the histogram-gating optimization from the performance plan
 */

export interface HistogramDiffResult {
  /** Histogram difference score (0-1) */
  score: number
  /** Raw histogram data for debugging */
  histogram?: number[]
}

/**
 * Compute 32×18 luma histogram difference between two textures
 * Uses GPU acceleration via WebGL for efficient calculation
 */
export async function gpuHistogramDiff(
  texLowRes1: OffscreenCanvas,
  texLowRes2: OffscreenCanvas
): Promise<HistogramDiffResult> {
  // Convert OffscreenCanvas to ImageData for histogram calculation
  // TODO: Implement true GPU histogram calculation using WebGL shader
  const imageData1 = canvasToImageData(texLowRes1)
  const imageData2 = canvasToImageData(texLowRes2)

  const hist1 = calculateLumaHistogram(imageData1, 32, 18)
  const hist2 = calculateLumaHistogram(imageData2, 32, 18)

  // Calculate histogram difference
  let totalDiff = 0
  for (let i = 0; i < hist1.length; i++) {
    totalDiff += Math.abs(hist1[i] - hist2[i])
  }

  // Normalize to 0-1 range
  const score = Math.min(totalDiff / hist1.length, 1)

  return {
    score,
    histogram: hist1 // Include histogram for debugging
  }
}

/**
 * Calculate SSIM at 160p resolution between two textures
 * Can use GPU shader or CPU calculation depending on availability
 */
export async function ssim160(
  texLowResPrev: OffscreenCanvas,
  texLowResCurr: OffscreenCanvas
): Promise<number> {
  const imageData1 = canvasToImageData(texLowResPrev)
  const imageData2 = canvasToImageData(texLowResCurr)

  // Calculate SSIM using existing CPU implementation
  // TODO: Implement GPU-accelerated SSIM using WebGL shader
  return calculateSSIM(imageData1, imageData2)
}

/**
 * Convert OffscreenCanvas to ImageData
 */
function canvasToImageData(canvas: OffscreenCanvas): ImageData {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get OffscreenCanvas context')
  }
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

/**
 * Calculate luma histogram with spatial subdivision
 * Divides image into 32x18 grid and calculates luma histogram for each cell
 */
function calculateLumaHistogram(
  imageData: ImageData,
  gridWidth: number,
  gridHeight: number
): number[] {
  const { data, width, height } = imageData
  const cellWidth = Math.floor(width / gridWidth)
  const cellHeight = Math.floor(height / gridHeight)
  const bins = 32 // 32 bins for luma values 0-255

  const histogram = new Array(gridWidth * gridHeight * bins).fill(0)

  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      const cellX = gx * cellWidth
      const cellY = gy * cellHeight

      // Calculate histogram for this cell
      const cellHist = new Array(bins).fill(0)
      let cellPixels = 0

      for (let y = cellY; y < Math.min(cellY + cellHeight, height); y++) {
        for (let x = cellX; x < Math.min(cellX + cellWidth, width); x++) {
          const index = (y * width + x) * 4
          const r = data[index]
          const g = data[index + 1]
          const b = data[index + 2]

          // Convert to luma
          const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
          const bin = Math.floor(luma / (256 / bins))

          cellHist[bin]++
          cellPixels++
        }
      }

      // Normalize and store in global histogram
      const histOffset = (gy * gridWidth + gx) * bins
      for (let b = 0; b < bins; b++) {
        histogram[histOffset + b] = cellHist[b] / Math.max(cellPixels, 1)
      }
    }
  }

  return histogram
}

/**
 * Calculate SSIM between two images at 160p resolution
 * Uses sliding window approach with optimized constants
 */
function calculateSSIM(imageData1: ImageData, imageData2: ImageData): number {
  const { data: data1, width, height } = imageData1
  const { data: data2 } = imageData2

  // SSIM constants
  const C1 = (0.01 * 255) ** 2
  const C2 = (0.03 * 255) ** 2

  const windowSize = 8
  let ssimSum = 0
  let windowCount = 0

  // Calculate SSIM over sliding windows
  for (let y = 0; y <= height - windowSize; y += windowSize) {
    for (let x = 0; x <= width - windowSize; x += windowSize) {
      const window1 = extractLumaWindow(data1, width, x, y, windowSize)
      const window2 = extractLumaWindow(data2, width, x, y, windowSize)

      const stats1 = calculateWindowStats(window1)
      const stats2 = calculateWindowStats(window2)

      // Simplified covariance calculation
      const covariance = calculateCovariance(window1, window2, stats1.mean, stats2.mean)

      const numerator = (2 * stats1.mean * stats2.mean + C1) * (2 * covariance + C2)
      const denominator = (stats1.mean ** 2 + stats2.mean ** 2 + C1) *
                         (stats1.variance + stats2.variance + C2)

      const ssim = numerator / denominator
      ssimSum += ssim
      windowCount++
    }
  }

  return ssimSum / Math.max(windowCount, 1)
}

/**
 * Extract luma values from a window in image data
 */
function extractLumaWindow(
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

      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      const luma = 0.299 * r + 0.587 * g + 0.114 * b

      window.push(luma)
    }
  }

  return window
}

/**
 * Calculate mean and variance for a window
 */
function calculateWindowStats(window: number[]): { mean: number; variance: number } {
  const sum = window.reduce((a, b) => a + b, 0)
  const mean = sum / window.length

  const variance = window.reduce((sum, val) => sum + (val - mean) ** 2, 0) / window.length

  return { mean, variance }
}

/**
 * Calculate covariance between two windows
 */
function calculateCovariance(
  window1: number[],
  window2: number[],
  mean1: number,
  mean2: number
): number {
  let covariance = 0
  for (let i = 0; i < window1.length; i++) {
    covariance += (window1[i] - mean1) * (window2[i] - mean2)
  }
  return covariance / window1.length
}
