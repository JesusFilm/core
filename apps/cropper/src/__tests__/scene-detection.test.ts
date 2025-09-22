import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  calculateFrameDifference,
  classifyChangeLevel,
  applyGaussianBlur,
  applyMorphologicalOps,
  downsampleImageData,
  rgbToGrayscale,
  calculateMotionVectors,
  calculateAverageBrightness,
  extractDominantColors,
  calculateCompositionScore,
  extractSceneMetadata,
  detectSceneChange
} from '../lib/scene-detection-utils'
import { DEFAULT_SCENE_DETECTION_CONFIG } from '../types/scene-tracking'

describe('Scene Change Detection', () => {
  describe('Frame Difference Calculation', () => {
    it('should calculate 0% difference for identical frames', () => {
      const frame1 = new Uint8ClampedArray([100, 100, 100, 100])
      const frame2 = new Uint8ClampedArray([100, 100, 100, 100])

      const difference = calculateFrameDifference(frame1, frame2)
      expect(difference).toBe(0)
    })

    it('should calculate 100% difference for completely different frames', () => {
      const frame1 = new Uint8ClampedArray([0, 0, 0, 0])
      const frame2 = new Uint8ClampedArray([255, 255, 255, 255])

      const difference = calculateFrameDifference(frame1, frame2, 0) // No threshold
      expect(difference).toBe(100)
    })

    it('should respect threshold parameter', () => {
      const frame1 = new Uint8ClampedArray([100, 100, 100, 100])
      const frame2 = new Uint8ClampedArray([110, 110, 110, 110])

      const difference = calculateFrameDifference(frame1, frame2, 20)
      expect(difference).toBe(0) // All differences are below threshold
    })
  })

  describe('Change Level Classification', () => {
    it('should classify stable changes', () => {
      expect(classifyChangeLevel(0.5)).toBe('stable')
      expect(classifyChangeLevel(1)).toBe('stable')
    })

    it('should classify moderate changes', () => {
      expect(classifyChangeLevel(1.5)).toBe('moderate')
      expect(classifyChangeLevel(2)).toBe('moderate')
      expect(classifyChangeLevel(3)).toBe('moderate')
    })

    it('should classify significant changes', () => {
      expect(classifyChangeLevel(3.5)).toBe('significant')
      expect(classifyChangeLevel(4)).toBe('significant')
      expect(classifyChangeLevel(5)).toBe('significant')
    })

    it('should classify transition changes', () => {
      expect(classifyChangeLevel(6)).toBe('transition')
      expect(classifyChangeLevel(10)).toBe('transition')
      expect(classifyChangeLevel(50)).toBe('transition')
    })
  })

  describe('Image Processing', () => {
    it('should convert RGB to grayscale correctly', () => {
      // Create mock image data (2x2 pixels)
      const mockImageData = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          255, 0, 0, 255,    // Red pixel
          0, 255, 0, 255,    // Green pixel
          0, 0, 255, 255,    // Blue pixel
          128, 128, 128, 255 // Gray pixel
        ])
      }

      const grayscale = rgbToGrayscale(mockImageData as any)

      // Check grayscale values using luminance formula
      expect(grayscale[0]).toBeCloseTo(Math.round(255 * 0.299), -1) // Red -> grayscale
      expect(grayscale[1]).toBeCloseTo(Math.round(255 * 0.587), -1) // Green -> grayscale
      expect(grayscale[2]).toBeCloseTo(Math.round(255 * 0.114), -1) // Blue -> grayscale
      expect(grayscale[3]).toBeCloseTo(128, -1) // Gray stays gray
    })

    it('should apply Gaussian blur', () => {
      const data = new Uint8ClampedArray([
        0, 255, 0,
        255, 100, 255,
        0, 255, 0
      ])

      const blurred = applyGaussianBlur(data, 3, 3)

      // Center pixel should be smoothed
      expect(blurred[4]).toBeGreaterThan(data[4]) // 100 -> higher value after blur
      expect(blurred[4]).toBeLessThan(255) // But not max value
    })

    it('should apply morphological operations', () => {
      const data = new Uint8ClampedArray([
        0, 0, 0,
        0, 255, 0,
        0, 0, 0
      ])

      const processed = applyMorphologicalOps(data, 3, 3)

      // Center pixel should be affected by erosion
      expect(processed[4]).toBe(0) // Isolated bright pixel gets eroded
    })

    it('should downsample image data', () => {
      const original = {
        width: 4,
        height: 4,
        data: new Uint8ClampedArray(4 * 4 * 4)
      }
      // Fill with test pattern
      for (let i = 0; i < original.data.length; i++) {
        original.data[i] = i % 4 === 0 ? 255 : 0 // R channel pattern
      }

      const downsampled = downsampleImageData(original as any, 2, 2)

      expect(downsampled.width).toBe(2)
      expect(downsampled.height).toBe(2)
      expect(downsampled.data.length).toBe(2 * 2 * 4)
    })
  })

  describe('Motion Vector Calculation', () => {
    it('should detect motion between frames', () => {
      // Create two frames with a moving object (larger frames for better motion detection)
      const width = 64, height = 64
      const frame1 = new Uint8ClampedArray(width * height)
      const frame2 = new Uint8ClampedArray(width * height)

      // Add a bright spot that moves
      frame1[32 * width + 32] = 255 // Center in frame 1
      frame2[40 * width + 40] = 255 // Offset in frame 2

      const motion = calculateMotionVectors(frame1, frame2, width, height)

      expect(motion.magnitude).toBeGreaterThan(0)
      expect(motion.dominantDirection).toBeDefined()
    })

    it('should handle no motion case', () => {
      const width = 16, height = 16
      const frame1 = new Uint8ClampedArray(width * height).fill(128)
      const frame2 = new Uint8ClampedArray(width * height).fill(128)

      const motion = calculateMotionVectors(frame1, frame2, width, height)

      expect(motion.magnitude).toBe(0)
      expect(motion.isCameraMovement).toBe(false)
    })
  })

  describe('Performance Considerations', () => {
    it('should process frames within reasonable time limits', () => {
      const width = 320, height = 180
      const frame1 = new Uint8ClampedArray(width * height).fill(100)
      const frame2 = new Uint8ClampedArray(width * height).fill(110)

      const startTime = performance.now()
      const difference = calculateFrameDifference(frame1, frame2)
      const endTime = performance.now()

      const processingTime = endTime - startTime

      // Should process within 50ms for typical frame size
      expect(processingTime).toBeLessThan(50)
      expect(difference).toBe(0) // All values within default threshold
    })

    it('should handle large frames efficiently', () => {
      const width = 640, height = 360
      const frame1 = new Uint8ClampedArray(width * height)
      const frame2 = new Uint8ClampedArray(width * height)

      // Create some differences
      for (let i = 0; i < frame1.length; i += 100) {
        frame1[i] = 100
        frame2[i] = 150
      }

      const startTime = performance.now()
      const difference = calculateFrameDifference(frame1, frame2, 25)
      const endTime = performance.now()

      const processingTime = endTime - startTime

    // Should process within 100ms even for larger frames
    expect(processingTime).toBeLessThan(100)
    expect(difference).toBeGreaterThan(0)
  })

  describe('Scene Metadata Extraction for Object Tracking', () => {
    it('should calculate average brightness correctly', () => {
      // Create test image data (2x2 pixels, all white)
      const imageData = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          255, 255, 255, 255, // White pixel
          255, 255, 255, 255, // White pixel
          255, 255, 255, 255, // White pixel
          255, 255, 255, 255  // White pixel
        ])
      }

      const brightness = calculateAverageBrightness(imageData as any)
      expect(brightness).toBe(100) // Should be 100% brightness for white image
    })

    it('should calculate brightness for mixed colors', () => {
      // Create test image data with mixed colors
      const imageData = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          255, 0, 0, 255,    // Red pixel (29.9% luminance)
          0, 255, 0, 255,    // Green pixel (58.7% luminance)
          0, 0, 255, 255,    // Blue pixel (11.4% luminance)
          128, 128, 128, 255 // Gray pixel (50% luminance)
        ])
      }

      const brightness = calculateAverageBrightness(imageData as any)
      // Average should be around (0.299 + 0.587 + 0.114 + 0.5) / 4 * 100
      expect(brightness).toBeCloseTo(37.55, 1)
    })

    it('should extract dominant colors', () => {
      // Create test image data with red and blue pixels
      const imageData = {
        width: 4,
        height: 4,
        data: new Uint8ClampedArray(4 * 4 * 4)
      }

      // Fill with alternating red and blue pixels
      for (let i = 0; i < imageData.data.length; i += 16) {
        // Red pixel
        imageData.data[i] = 255     // R
        imageData.data[i + 1] = 0   // G
        imageData.data[i + 2] = 0   // B
        imageData.data[i + 3] = 255 // A

        // Blue pixel
        imageData.data[i + 4] = 0   // R
        imageData.data[i + 5] = 0   // G
        imageData.data[i + 6] = 255 // B
        imageData.data[i + 7] = 255 // A
      }

      const colors = extractDominantColors(imageData as any, 2)
      expect(colors.length).toBeGreaterThan(0)
      expect(colors[0]).toHaveProperty('r')
      expect(colors[0]).toHaveProperty('g')
      expect(colors[0]).toHaveProperty('b')
      expect(colors[0]).toHaveProperty('percentage')
    })

    it('should calculate composition score', () => {
      const width = 8, height = 8
      const grayscale = new Uint8ClampedArray(width * height)

      // Create a simple pattern with some edges
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x
          grayscale[idx] = (x + y) % 2 === 0 ? 255 : 0 // Checkerboard pattern
        }
      }

      const score = calculateCompositionScore(grayscale, width, height)
      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should extract complete scene metadata', () => {
      const imageData = {
        width: 4,
        height: 4,
        data: new Uint8ClampedArray([
          255, 255, 255, 255, // White
          128, 128, 128, 255, // Gray
          0, 0, 0, 255,       // Black
          255, 0, 0, 255      // Red
        ])
      }

      const metadata = extractSceneMetadata(imageData as any, 1000, 'test_scene')

      expect(metadata).toHaveProperty('id', 'test_scene')
      expect(metadata).toHaveProperty('startTime', 1000)
      expect(metadata).toHaveProperty('endTime', 1000)
      expect(metadata).toHaveProperty('averageBrightness')
      expect(metadata).toHaveProperty('brightnessVariance')
      expect(metadata).toHaveProperty('dominantColors')
      expect(metadata).toHaveProperty('compositionScore')
      expect(metadata).toHaveProperty('lightingCondition')
      expect(metadata.averageBrightness).toBeGreaterThan(0)
      expect(metadata.averageBrightness).toBeLessThanOrEqual(100)
    })

    it('should detect scene changes based on brightness', () => {
      // Create two different scenes
      const scene1Data = {
        width: 4,
        height: 4,
        data: new Uint8ClampedArray(4 * 4 * 4).fill(255) // All white
      }

      const scene2Data = {
        width: 4,
        height: 4,
        data: new Uint8ClampedArray(4 * 4 * 4).fill(0) // All black
      }

      const scene1 = extractSceneMetadata(scene1Data as any, 1000, 'scene_1')
      const scene2 = extractSceneMetadata(scene2Data as any, 2000, 'scene_2')

      const changeEvent = detectSceneChange(scene1, scene2, DEFAULT_SCENE_DETECTION_CONFIG)

      expect(changeEvent).toBeTruthy()
      // The algorithm may detect this as content_transition due to color differences
      expect(['brightness_change', 'content_transition']).toContain(changeEvent?.changeType)
      expect(changeEvent?.confidence).toBeGreaterThan(0)
    })

    it('should not detect scene change for similar scenes', () => {
      // Create two similar scenes
      const scene1Data = {
        width: 4,
        height: 4,
        data: new Uint8ClampedArray(4 * 4 * 4).fill(128) // All medium gray
      }

      const scene2Data = {
        width: 4,
        height: 4,
        data: new Uint8ClampedArray(4 * 4 * 4).fill(130) // Slightly different gray
      }

      const scene1 = extractSceneMetadata(scene1Data as any, 1000, 'scene_1')
      const scene2 = extractSceneMetadata(scene2Data as any, 2000, 'scene_2')

      const changeEvent = detectSceneChange(scene1, scene2, DEFAULT_SCENE_DETECTION_CONFIG)

      // Should not detect change due to low brightness difference
      expect(changeEvent).toBeNull()
    })

    it('should handle first scene (no previous scene)', () => {
      const sceneData = {
        width: 4,
        height: 4,
        data: new Uint8ClampedArray(4 * 4 * 4).fill(128)
      }

      const currentScene = extractSceneMetadata(sceneData as any, 1000, 'scene_1')
      const changeEvent = detectSceneChange(null, currentScene, DEFAULT_SCENE_DETECTION_CONFIG)

      expect(changeEvent).toBeNull() // No change event for first scene
    })
  })
})
})
