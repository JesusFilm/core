import type { SceneChangeLevel, SceneChangeConfig } from '../types/detection'
import type {
  SceneMetadata,
  SceneChangeEvent,
  SceneChangeType,
  SceneDetectionConfig,
  ColorInfo,
  SceneChangeMetadata
} from '../types/scene-tracking'
import { DEFAULT_SCENE_DETECTION_CONFIG } from '../types/scene-tracking'

// Default configuration for scene detection
export const DEFAULT_SCENE_CONFIG: SceneChangeConfig = {
  frameRate: 2,
  threshold: {
    stable: 1,       // 0-1%
    moderate: 3,     // 1-3%
    significant: 5,  // 3-5%
    transition: 5    // 5-100%
  },
  noiseReduction: {
    gaussianBlur: 3,
    morphologicalOps: true,
    temporalSmoothing: 3
  },
  performance: {
    downsampleTo: { width: 320, height: 180 },
    useWebGL: true,
    maxFrameBuffer: 5
  }
}

// Gaussian blur kernel for noise reduction
export const gaussianKernel = [
  [1, 2, 1],
  [2, 4, 2],
  [1, 2, 1]
]

// Convert RGB to grayscale
export const rgbToGrayscale = (imageData: ImageData): Uint8ClampedArray => {
  const { data, width, height } = imageData
  const grayscale = new Uint8ClampedArray(width * height)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    // Standard luminance formula
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    grayscale[i / 4] = gray
  }

  return grayscale
}

// Apply Gaussian blur for noise reduction
export const applyGaussianBlur = (grayscaleData: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray => {
  const kernelSize = DEFAULT_SCENE_CONFIG.noiseReduction.gaussianBlur
  const kernel = gaussianKernel
  const kernelSum = 16 // Sum of gaussian kernel values
  const blurred = new Uint8ClampedArray(width * height)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixelIndex = (y + ky) * width + (x + kx)
          sum += grayscaleData[pixelIndex] * kernel[ky + 1][kx + 1]
        }
      }
      const currentIndex = y * width + x
      blurred[currentIndex] = Math.round(sum / kernelSum)
    }
  }

  return blurred
}

// Apply Sobel edge detection to grayscale image
export const applySobelEdgeDetection = (
  grayscaleData: Uint8ClampedArray,
  width: number,
  height: number
): Uint8ClampedArray => {
  const result = new Uint8ClampedArray(grayscaleData.length)

  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0
      let gy = 0

      // Apply Sobel convolution
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = grayscaleData[(y + ky) * width + (x + kx)]
          const kernelIndex = (ky + 1) * 3 + (kx + 1)
          gx += pixel * sobelX[kernelIndex]
          gy += pixel * sobelY[kernelIndex]
        }
      }

      // Calculate gradient magnitude
      const magnitude = Math.sqrt(gx * gx + gy * gy)
      const idx = y * width + x
      result[idx] = Math.min(255, Math.max(0, magnitude))
    }
  }

  return result
}

// Calculate edge difference between two edge-detected frames
export const calculateEdgeDifference = (
  edges1: Uint8ClampedArray,
  edges2: Uint8ClampedArray,
  threshold: number = 50
): number => {
  if (edges1.length !== edges2.length) {
    throw new Error('Edge frame sizes do not match')
  }

  let changedPixels = 0
  const totalPixels = edges1.length

  for (let i = 0; i < totalPixels; i++) {
    const diff = Math.abs(edges1[i] - edges2[i])
    if (diff > threshold) {
      changedPixels++
    }
  }

  return (changedPixels / totalPixels) * 100
}

// Calculate absolute difference between two grayscale frames (kept for backward compatibility)
export const calculateFrameDifference = (
  frame1: Uint8ClampedArray,
  frame2: Uint8ClampedArray,
  threshold: number = 30
): number => {
  if (frame1.length !== frame2.length) {
    throw new Error('Frame sizes do not match')
  }

  let changedPixels = 0
  const totalPixels = frame1.length

  for (let i = 0; i < totalPixels; i++) {
    const diff = Math.abs(frame1[i] - frame2[i])
    if (diff > threshold) {
      changedPixels++
    }
  }

  return (changedPixels / totalPixels) * 100
}

// Apply morphological operations to reduce noise
export const applyMorphologicalOps = (data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray => {
  if (!DEFAULT_SCENE_CONFIG.noiseReduction.morphologicalOps) {
    return data
  }

  const result = new Uint8ClampedArray(data.length)

  // Simple morphological opening (erosion followed by dilation)
  // This removes small noise pixels
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      const neighbors = [
        data[(y - 1) * width + (x - 1)],
        data[(y - 1) * width + x],
        data[(y - 1) * width + (x + 1)],
        data[y * width + (x - 1)],
        data[idx],
        data[y * width + (x + 1)],
        data[(y + 1) * width + (x - 1)],
        data[(y + 1) * width + x],
        data[(y + 1) * width + (x + 1)]
      ]

      // Erosion: keep pixel only if all neighbors are above threshold
      const minNeighbor = Math.min(...neighbors)
      result[idx] = minNeighbor
    }
  }

  return result
}

// Downsample image data for performance
export const downsampleImageData = (imageData: ImageData, targetWidth: number, targetHeight: number): ImageData => {
  const { width: sourceWidth, height: sourceHeight, data: sourceData } = imageData

  // Handle environments where ImageData constructor is not available (e.g., tests)
  let downsampled: ImageData
  try {
    downsampled = new ImageData(targetWidth, targetHeight)
  } catch (error) {
    // Fallback for test environments
    downsampled = {
      width: targetWidth,
      height: targetHeight,
      data: new Uint8ClampedArray(targetWidth * targetHeight * 4)
    } as ImageData
  }

  const { data: targetData } = downsampled

  const scaleX = sourceWidth / targetWidth
  const scaleY = sourceHeight / targetHeight

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const sourceX = Math.floor(x * scaleX)
      const sourceY = Math.floor(y * scaleY)
      const sourceIndex = (sourceY * sourceWidth + sourceX) * 4
      const targetIndex = (y * targetWidth + x) * 4

      // Copy RGBA values
      targetData[targetIndex] = sourceData[sourceIndex]     // R
      targetData[targetIndex + 1] = sourceData[sourceIndex + 1] // G
      targetData[targetIndex + 2] = sourceData[sourceIndex + 2] // B
      targetData[targetIndex + 3] = sourceData[sourceIndex + 3] // A
    }
  }

  return downsampled
}

// Classify change level based on percentage
export const classifyChangeLevel = (changePercentage: number): SceneChangeLevel => {
  const { threshold } = DEFAULT_SCENE_CONFIG

  if (changePercentage <= threshold.stable) return 'stable'
  if (changePercentage <= threshold.moderate) return 'moderate'
  if (changePercentage <= threshold.significant) return 'significant'
  return 'transition'
}

// Calculate motion vectors (simplified optical flow)
export const calculateMotionVectors = (
  frame1: Uint8ClampedArray,
  frame2: Uint8ClampedArray,
  width: number,
  height: number
): { dominantDirection: number; magnitude: number; isCameraMovement: boolean } => {
  // Simplified motion estimation using block matching
  const blockSize = 16
  const searchRange = 8
  let totalMotionX = 0
  let totalMotionY = 0
  let motionCount = 0

  for (let y = blockSize; y < height - blockSize; y += blockSize) {
    for (let x = blockSize; x < width - blockSize; x += blockSize) {
      let bestSAD = Infinity
      let bestDx = 0
      let bestDy = 0

      // Search for best matching block
      for (let dy = -searchRange; dy <= searchRange; dy++) {
        for (let dx = -searchRange; dx <= searchRange; dx++) {
          if (x + dx < 0 || x + dx + blockSize >= width ||
              y + dy < 0 || y + dy + blockSize >= height) continue

          let sad = 0
          for (let by = 0; by < blockSize; by++) {
            for (let bx = 0; bx < blockSize; bx++) {
              const idx1 = (y + by) * width + (x + bx)
              const idx2 = (y + dy + by) * width + (x + dx + bx)
              sad += Math.abs(frame1[idx1] - frame2[idx2])
            }
          }

          if (sad < bestSAD) {
            bestSAD = sad
            bestDx = dx
            bestDy = dy
          }
        }
      }

      totalMotionX += bestDx
      totalMotionY += bestDy
      motionCount++
    }
  }

  const avgMotionX = motionCount > 0 ? totalMotionX / motionCount : 0
  const avgMotionY = motionCount > 0 ? totalMotionY / motionCount : 0
  const magnitude = Math.sqrt(avgMotionX * avgMotionX + avgMotionY * avgMotionY)
  const dominantDirection = Math.atan2(avgMotionY, avgMotionX)

  // Determine if this looks like camera movement (consistent motion across frame)
  const consistencyThreshold = 0.7
  const isCameraMovement = magnitude > 2 && motionCount > 10

  return {
    dominantDirection,
    magnitude,
    isCameraMovement
  }
}

// ============================================================================
// Scene Metadata Extraction Functions for Object Tracking
// ============================================================================

// Calculate average brightness of a frame
export const calculateAverageBrightness = (imageData: ImageData): number => {
  const { data } = imageData
  let totalBrightness = 0
  const pixelCount = data.length / 4

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    // Use luminance formula for perceived brightness
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b
    totalBrightness += brightness
  }

  return totalBrightness / pixelCount / 255 * 100 // Return as percentage
}

// Calculate brightness variance (contrast measure)
export const calculateBrightnessVariance = (imageData: ImageData): number => {
  const { data } = imageData
  const avgBrightness = calculateAverageBrightness(imageData)
  let variance = 0
  const pixelCount = data.length / 4

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255 * 100
    variance += Math.pow(brightness - avgBrightness, 2)
  }

  return variance / pixelCount
}

// Extract dominant colors using k-means clustering (simplified)
export const extractDominantColors = (imageData: ImageData, numColors: number = 5): ColorInfo[] => {
  const { data, width, height } = imageData
  const colors: { r: number; g: number; b: number; count: number }[] = []

  // Sample pixels (every 10th pixel for performance)
  const sampleStep = 10
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const idx = (y * width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]

      // Find closest existing color or create new one
      let closestIdx = -1
      let closestDistance = Infinity

      for (let i = 0; i < colors.length; i++) {
        const dr = colors[i].r - r
        const dg = colors[i].g - g
        const db = colors[i].b - b
        const distance = Math.sqrt(dr * dr + dg * dg + db * db)

        if (distance < closestDistance) {
          closestDistance = distance
          closestIdx = i
        }
      }

      if (closestDistance < 30 && colors.length >= numColors) {
        // Merge with closest color
        colors[closestIdx].r = (colors[closestIdx].r * colors[closestIdx].count + r) / (colors[closestIdx].count + 1)
        colors[closestIdx].g = (colors[closestIdx].g * colors[closestIdx].count + g) / (colors[closestIdx].count + 1)
        colors[closestIdx].b = (colors[closestIdx].b * colors[closestIdx].count + b) / (colors[closestIdx].count + 1)
        colors[closestIdx].count++
      } else if (colors.length < numColors) {
        // Add new color
        colors.push({ r, g, b, count: 1 })
      }
    }
  }

  // Convert to ColorInfo format and calculate percentages
  const totalPixels = colors.reduce((sum, color) => sum + color.count, 0)
  return colors.map(color => ({
    r: Math.round(color.r),
    g: Math.round(color.g),
    b: Math.round(color.b),
    percentage: (color.count / totalPixels) * 100
  })).sort((a, b) => b.percentage - a.percentage)
}

// Calculate composition score based on edges and contrast
export const calculateCompositionScore = (grayscaleData: Uint8ClampedArray, width: number, height: number): number => {
  let edgeStrength = 0
  let contrastScore = 0

  // Calculate edges using Sobel operator
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      const gx =
        -grayscaleData[(y - 1) * width + (x - 1)] +
         grayscaleData[(y - 1) * width + (x + 1)] +
        -2 * grayscaleData[y * width + (x - 1)] +
         2 * grayscaleData[y * width + (x + 1)] +
        -grayscaleData[(y + 1) * width + (x - 1)] +
         grayscaleData[(y + 1) * width + (x + 1)]

      const gy =
         grayscaleData[(y - 1) * width + (x - 1)] +
         2 * grayscaleData[(y - 1) * width + x] +
         grayscaleData[(y - 1) * width + (x + 1)] +
        -grayscaleData[(y + 1) * width + (x - 1)] +
        -2 * grayscaleData[(y + 1) * width + x] +
        -grayscaleData[(y + 1) * width + (x + 1)]

      const magnitude = Math.sqrt(gx * gx + gy * gy)
      edgeStrength += magnitude
    }
  }

  // Calculate contrast score
  const avgBrightness = grayscaleData.reduce((sum, val) => sum + val, 0) / grayscaleData.length
  for (const pixel of grayscaleData) {
    contrastScore += Math.abs(pixel - avgBrightness)
  }
  contrastScore /= grayscaleData.length

  // Normalize to 0-100 scale
  const normalizedEdges = Math.min(edgeStrength / (width * height * 255) * 100, 100)
  const normalizedContrast = Math.min(contrastScore / 127.5 * 100, 100)

  return (normalizedEdges + normalizedContrast) / 2
}

// Determine lighting condition from brightness
export const determineLightingCondition = (averageBrightness: number): 'bright' | 'normal' | 'dim' | 'dark' => {
  if (averageBrightness >= 70) return 'bright'
  if (averageBrightness >= 40) return 'normal'
  if (averageBrightness >= 20) return 'dim'
  return 'dark'
}

// Extract complete scene metadata from frame
export const extractSceneMetadata = (
  imageData: ImageData,
  frameTimestamp: number,
  sceneId: string
): SceneMetadata => {
  const grayscale = rgbToGrayscale(imageData)
  const blurred = applyGaussianBlur(grayscale, imageData.width, imageData.height)

  const averageBrightness = calculateAverageBrightness(imageData)
  const brightnessVariance = calculateBrightnessVariance(imageData)
  const dominantColors = extractDominantColors(imageData)
  const compositionScore = calculateCompositionScore(blurred, imageData.width, imageData.height)

  // Simplified motion intensity (would be calculated from frame differences in real implementation)
  const motionIntensity = 0 // Placeholder - would use frame differences
  const cameraMovement = false // Placeholder - would use motion vectors

  const lightingCondition = determineLightingCondition(averageBrightness)

  return {
    id: sceneId,
    startTime: frameTimestamp,
    endTime: frameTimestamp,
    averageBrightness,
    brightnessVariance,
    dominantColors,
    compositionScore,
    motionIntensity,
    cameraMovement,
    lightingCondition,
    frameCount: 1
  }
}

// Update scene metadata with new frame data
export const updateSceneMetadata = (
  currentMetadata: SceneMetadata,
  newFrameData: ImageData,
  frameTimestamp: number
): SceneMetadata => {
  const newMetadata = extractSceneMetadata(newFrameData, frameTimestamp, currentMetadata.id)

  // Calculate weighted averages
  const totalFrames = currentMetadata.frameCount + 1
  const currentWeight = currentMetadata.frameCount / totalFrames
  const newWeight = 1 / totalFrames

  return {
    ...currentMetadata,
    endTime: frameTimestamp,
    averageBrightness: currentMetadata.averageBrightness * currentWeight + newMetadata.averageBrightness * newWeight,
    brightnessVariance: currentMetadata.brightnessVariance * currentWeight + newMetadata.brightnessVariance * newWeight,
    compositionScore: currentMetadata.compositionScore * currentWeight + newMetadata.compositionScore * newWeight,
    motionIntensity: currentMetadata.motionIntensity * currentWeight + newMetadata.motionIntensity * newWeight,
    cameraMovement: currentMetadata.cameraMovement || newMetadata.cameraMovement,
    lightingCondition: newMetadata.lightingCondition, // Use most recent
    frameCount: totalFrames
  }
}

// ============================================================================
// Scene Change Detection for Object Tracking
// ============================================================================

// Detect scene change based on metadata comparison
export const detectSceneChange = (
  previousMetadata: SceneMetadata | null,
  currentMetadata: SceneMetadata,
  config: SceneDetectionConfig
): SceneChangeEvent | null => {
  if (!previousMetadata) return null

  const brightnessDelta = Math.abs(currentMetadata.averageBrightness - previousMetadata.averageBrightness)
  const colorShift = calculateColorShift(previousMetadata.dominantColors, currentMetadata.dominantColors)
  const compositionChange = Math.abs(currentMetadata.compositionScore - previousMetadata.compositionScore)
  const motionChange = Math.abs(currentMetadata.motionIntensity - previousMetadata.motionIntensity)

  // Determine change type and confidence
  let changeType: SceneChangeType = 'brightness_change'
  let maxChange = brightnessDelta
  let confidence = brightnessDelta / 100

  if (colorShift > maxChange) {
    changeType = 'content_transition'
    maxChange = colorShift
    confidence = colorShift / 100
  }

  if (compositionChange > maxChange) {
    changeType = 'composition_change'
    maxChange = compositionChange
    confidence = compositionChange / 100
  }

  if (motionChange > maxChange && currentMetadata.cameraMovement) {
    changeType = 'camera_movement'
    maxChange = motionChange
    confidence = motionChange / 100
  }

  // Check if change exceeds thresholds
  const exceedsThreshold =
    brightnessDelta >= config.brightnessThreshold ||
    colorShift >= config.colorThreshold ||
    compositionChange >= config.compositionThreshold ||
    motionChange >= config.motionThreshold

  if (!exceedsThreshold) return null

  return {
    id: `change_${Date.now()}`,
    timestamp: currentMetadata.startTime,
    fromSceneId: previousMetadata.id,
    toSceneId: currentMetadata.id,
    changeType,
    confidence: Math.min(confidence, 1),
    metadata: {
      brightnessDelta,
      colorShift,
      motionMagnitude: motionChange,
      compositionChange,
      processingTime: 0 // Would be measured in real implementation
    }
  }
}

// Calculate color shift between two color palettes
const calculateColorShift = (colors1: ColorInfo[], colors2: ColorInfo[]): number => {
  let totalShift = 0
  const maxColors = Math.max(colors1.length, colors2.length)

  for (let i = 0; i < maxColors; i++) {
    const color1 = colors1[i] || { r: 0, g: 0, b: 0, percentage: 0 }
    const color2 = colors2[i] || { r: 0, g: 0, b: 0, percentage: 0 }

    const dr = color1.r - color2.r
    const dg = color1.g - color2.g
    const db = color1.b - color2.b
    const colorDistance = Math.sqrt(dr * dr + dg * dg + db * db) / 441.67 // Max possible distance for RGB 0-255

    const weight = (color1.percentage + color2.percentage) / 200 // Average percentage as weight
    totalShift += colorDistance * weight * 100
  }

  return totalShift
}

// Check if scene should be split based on duration
export const shouldSplitScene = (
  scene: SceneMetadata,
  currentTime: number,
  config: SceneDetectionConfig
): boolean => {
  const duration = currentTime - scene.startTime
  return duration >= config.maxSceneDuration
}

// Check if scene is long enough to be valid
export const isValidScene = (scene: SceneMetadata, config: SceneDetectionConfig): boolean => {
  const duration = scene.endTime - scene.startTime
  return duration >= config.minSceneDuration
}
