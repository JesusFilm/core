import {
  extractCenters,
  calculateCropBoxFromCenter,
  getTargetAspectRatio,
  createMockFrame
} from '../lib/center-based-cropping'
import type { PreprocessedCropFrame } from '../types'

/**
 * Implementation Details Validation Tests - V-TEST-3.md
 * Tests that validate exact string/number/array matches, CSS properties,
 * DOM structure, and implementation specifics
 */

describe('Center-Based Cropping - Implementation Details Validation', () => {

  describe('Exact Number/String Matches - Core Function Outputs', () => {
    test('getTargetAspectRatio returns exact value 0.5625 (9/16)', () => {
      const result = getTargetAspectRatio()
      expect(result).toBe(0.5625)
      expect(result).toBe(9 / 16)
      expect(result.toFixed(4)).toBe('0.5625')
    })

    test('extractCenters returns exact coordinate values from window.focusX/Y', () => {
      const mockFrame = createMockFrame({
        window: { focusX: 0.5, focusY: 0.3, scale: 0.8 }
      })

      const result = extractCenters(mockFrame)

      expect(result.centerX).toBe(0.5)
      expect(result.centerY).toBe(0.3)
      expect(Object.keys(result)).toEqual(['centerX', 'centerY'])
      expect(result).toStrictEqual({ centerX: 0.5, centerY: 0.3 })
    })

    test('calculateCropBoxFromCenter returns exact toFixed(4) precision values', () => {
      const result = calculateCropBoxFromCenter(
        0.5,    // centerX
        0.5,    // centerY (ignored)
        16/9,   // videoAspectRatio (1.777...)
        9/16    // targetAspectRatio (0.5625)
      )

      // Exact expected values based on implementation
      expect(result).toStrictEqual({
        x: 0.3418,
        y: 0,
        width: 0.3164,
        height: 1.0
      })

      // Verify toFixed(4) precision
      expect(result.x.toFixed(4)).toBe('0.3418')
      expect(result.y.toFixed(4)).toBe('0.0000')
      expect(result.width.toFixed(4)).toBe('0.3164')
      expect(result.height.toFixed(4)).toBe('1.0000')
    })

    test('calculateCropBoxFromCenter exact calculation for edge case centerX=0', () => {
      const result = calculateCropBoxFromCenter(
        0,      // centerX at left edge
        0.5,    // centerY (ignored)
        16/9,   // videoAspectRatio
        9/16    // targetAspectRatio
      )

      // Width = 1.0 * (0.5625 / 1.777...) = 0.3164
      // x = max(0, min(1 - 0.3164, 0 - 0.3164/2)) = max(0, min(0.6836, -0.1582)) = 0
      expect(result).toStrictEqual({
        x: 0,
        y: 0,
        width: 0.3164,
        height: 1.0
      })
    })

    test('calculateCropBoxFromCenter exact calculation for edge case centerX=1', () => {
      const result = calculateCropBoxFromCenter(
        1,      // centerX at right edge
        0.5,    // centerY (ignored)
        16/9,   // videoAspectRatio
        9/16    // targetAspectRatio
      )

      // Width = 0.3164
      // x = max(0, min(0.6836, 1 - 0.3164/2)) = max(0, min(0.6836, 0.8418)) = 0.6836
      expect(result).toStrictEqual({
        x: 0.6836,
        y: 0,
        width: 0.3164,
        height: 1.0
      })
    })

    test('createMockFrame returns exact default structure', () => {
      const result = createMockFrame()

      expect(result).toStrictEqual({
        time: 5.5,
        cropBox: { x: 0.2, y: 0.1, width: 0.6, height: 0.8 },
        window: { focusX: 0.5, focusY: 0.3, scale: 0.8 },
        confidence: 0.85,
        hasSceneChange: false,
        metadata: { processingTime: 150, sourceFrame: 275, interpolationUsed: false }
      })

      // Verify exact types and structure
      expect(typeof result.time).toBe('number')
      expect(typeof result.confidence).toBe('number')
      expect(typeof result.hasSceneChange).toBe('boolean')
      expect(Array.isArray(Object.keys(result))).toBe(true)
    })
  })

  describe('Exact Error Messages - String Matching', () => {
    test('extractCenters throws exact error message for null frame', () => {
      expect(() => extractCenters(null as any)).toThrow('Invalid frame provided')
    })

    test('extractCenters throws exact error message for missing window', () => {
      const frame = createMockFrame({ window: undefined as any })
      expect(() => extractCenters(frame)).toThrow('Missing window configuration')
    })

    test('extractCenters throws exact error message for focusX < 0', () => {
      const frame = createMockFrame({
        window: { focusX: -0.1, focusY: 0.5, scale: 0.8 }
      })
      expect(() => extractCenters(frame)).toThrow('focusX must be between 0 and 1')
    })

    test('extractCenters throws exact error message for focusX > 1', () => {
      const frame = createMockFrame({
        window: { focusX: 1.1, focusY: 0.5, scale: 0.8 }
      })
      expect(() => extractCenters(frame)).toThrow('focusX must be between 0 and 1')
    })

    test('extractCenters throws exact error message for focusY < 0', () => {
      const frame = createMockFrame({
        window: { focusX: 0.5, focusY: -0.1, scale: 0.8 }
      })
      expect(() => extractCenters(frame)).toThrow('focusY must be between 0 and 1')
    })

    test('extractCenters throws exact error message for focusY > 1', () => {
      const frame = createMockFrame({
        window: { focusX: 0.5, focusY: 1.1, scale: 0.8 }
      })
      expect(() => extractCenters(frame)).toThrow('focusY must be between 0 and 1')
    })

    test('calculateCropBoxFromCenter throws exact error messages', () => {
      expect(() => calculateCropBoxFromCenter(NaN, 0.5, 16/9, 9/16))
        .toThrow('Invalid centerX value')

      expect(() => calculateCropBoxFromCenter(Infinity, 0.5, 16/9, 9/16))
        .toThrow('Invalid centerX value')

      expect(() => calculateCropBoxFromCenter(0.5, NaN, 16/9, 9/16))
        .toThrow('Invalid centerY value')

      expect(() => calculateCropBoxFromCenter(0.5, 0.5, 0, 9/16))
        .toThrow('Invalid video aspect ratio')

      expect(() => calculateCropBoxFromCenter(0.5, 0.5, 16/9, -1))
        .toThrow('Invalid target aspect ratio')
    })
  })

  describe('Mathematical Precision - Exact Calculations', () => {
    test('calculateCropBoxFromCenter exact mathematical operations', () => {
      // Test case: centerX = 0.5, videoRatio = 16/9 ≈ 1.7778, targetRatio = 9/16 = 0.5625

      // Step 1: height = 1.0 (always full height)
      // Step 2: width = height * (targetRatio / videoRatio) = 1.0 * (0.5625 / 1.7778) ≈ 0.3164
      // Step 3: x = max(0, min(1 - width, centerX - width/2)) = max(0, min(0.6836, 0.5 - 0.1582)) = max(0, min(0.6836, 0.3418)) = 0.3418

      const result = calculateCropBoxFromCenter(0.5, 0.5, 16/9, 9/16)

      // Verify exact mathematical results
      const expectedWidth = (9/16) / (16/9) // 0.5625 / 1.7778 ≈ 0.3164
      const expectedX = 0.5 - expectedWidth / 2 // 0.5 - 0.1582 = 0.3418

      expect(result.width).toBeCloseTo(expectedWidth, 4)
      expect(result.x).toBeCloseTo(expectedX, 4)
      expect(result.y).toBe(0) // Always 0
      expect(result.height).toBe(1.0) // Always 1.0
    })

    test('calculateCropBoxFromCenter exact boundary clamping calculations', () => {
      // Test left boundary clamping
      const leftResult = calculateCropBoxFromCenter(0, 0.5, 16/9, 9/16)
      const width = (9/16) / (16/9) // ≈ 0.3164
      const unclampedX = 0 - width / 2 // -0.1582
      expect(leftResult.x).toBe(Math.max(0, unclampedX)) // Should be 0

      // Test right boundary clamping
      const rightResult = calculateCropBoxFromCenter(1, 0.5, 16/9, 9/16)
      const unclampedXRight = 1 - width / 2 // 0.8418
      const maxX = 1 - width // 0.6836
      expect(rightResult.x).toBeCloseTo(Math.min(maxX, unclampedXRight), 4) // Should be close to 0.6836
    })

    test('extractCenters exact validation logic', () => {
      // Test exact validation boundaries
      expect(() => extractCenters(createMockFrame({
        window: { focusX: -0.0001, focusY: 0.5, scale: 0.8 }
      }))).toThrow('focusX must be between 0 and 1')

      expect(() => extractCenters(createMockFrame({
        window: { focusX: 1.0001, focusY: 0.5, scale: 0.8 }
      }))).toThrow('focusX must be between 0 and 1')

      // Test exact boundary acceptance
      expect(extractCenters(createMockFrame({
        window: { focusX: 0, focusY: 0.5, scale: 0.8 }
      })).centerX).toBe(0)

      expect(extractCenters(createMockFrame({
        window: { focusX: 1, focusY: 0.5, scale: 0.8 }
      })).centerX).toBe(1)
    })
  })

  describe('Object Structure and Property Validation', () => {
    test('extractCenters returns exact object structure', () => {
      const result = extractCenters(createMockFrame())

      // Exact property structure
      expect(result).toHaveProperty('centerX')
      expect(result).toHaveProperty('centerY')
      expect(Object.getOwnPropertyNames(result)).toEqual(['centerX', 'centerY'])
      expect(Object.getOwnPropertyDescriptor(result, 'centerX')?.configurable).toBe(true)
      expect(Object.getOwnPropertyDescriptor(result, 'centerY')?.configurable).toBe(true)
    })

    test('calculateCropBoxFromCenter returns exact object structure', () => {
      const result = calculateCropBoxFromCenter(0.5, 0.5, 16/9, 9/16)

      // Exact property structure
      expect(result).toHaveProperty('x')
      expect(result).toHaveProperty('y')
      expect(result).toHaveProperty('width')
      expect(result).toHaveProperty('height')

      const properties = Object.getOwnPropertyNames(result)
      expect(properties).toEqual(['x', 'y', 'width', 'height'])

      // All properties should be numbers
      properties.forEach(prop => {
        expect(typeof (result as any)[prop]).toBe('number')
      })
    })

    test('createMockFrame returns exact nested structure', () => {
      const result = createMockFrame()

      // Exact nested structure validation
      expect(result.window).toHaveProperty('focusX')
      expect(result.window).toHaveProperty('focusY')
      expect(result.window).toHaveProperty('scale')

      expect(result.cropBox).toHaveProperty('x')
      expect(result.cropBox).toHaveProperty('y')
      expect(result.cropBox).toHaveProperty('width')
      expect(result.cropBox).toHaveProperty('height')

      expect(result.metadata).toHaveProperty('processingTime')
      expect(result.metadata).toHaveProperty('sourceFrame')
      expect(result.metadata).toHaveProperty('interpolationUsed')

      // Exact property counts
      expect(Object.keys(result)).toHaveLength(6)
      expect(Object.keys(result.window)).toHaveLength(3)
      expect(Object.keys(result.cropBox)).toHaveLength(4)
      expect(Object.keys(result.metadata)).toHaveLength(3)
    })
  })

  describe('Array and Collection Validation', () => {
    test('extractCenters returns consistent array-like behavior', () => {
      const result = extractCenters(createMockFrame())

      // Object.values should return values in exact order
      expect(Object.values(result)).toEqual([0.5, 0.3])

      // Object.entries should return exact key-value pairs
      expect(Object.entries(result)).toEqual([
        ['centerX', 0.5],
        ['centerY', 0.3]
      ])

      // Array.from should work on values
      expect(Array.from(Object.values(result))).toEqual([0.5, 0.3])
    })

    test('calculateCropBoxFromCenter returns consistent array-like behavior', () => {
      const result = calculateCropBoxFromCenter(0.5, 0.5, 16/9, 9/16)

      // Object.values should return values in exact order
      const values = Object.values(result)
      expect(values.length).toBe(4)
      expect(values.every(v => typeof v === 'number')).toBe(true)

      // Object.keys should return exact property names
      expect(Object.keys(result).sort()).toEqual(['height', 'width', 'x', 'y'])
    })

    test('createMockFrame handles array overrides correctly', () => {
      const customMetadata = { processingTime: 200, sourceFrame: 300, interpolationUsed: true }
      const result = createMockFrame({
        metadata: customMetadata
      })

      // Exact array/object structure preservation
      expect(result.metadata).toStrictEqual(customMetadata)
      expect(Object.is(result.metadata, customMetadata)).toBe(true) // Same reference
    })
  })

  describe('Type and Instance Validation', () => {
    test('extractCenters returns exact type instances', () => {
      const result = extractCenters(createMockFrame())

      expect(result).toBeInstanceOf(Object)
      expect(result.constructor.name).toBe('Object')

      // Exact property descriptors
      const centerXDescriptor = Object.getOwnPropertyDescriptor(result, 'centerX')
      const centerYDescriptor = Object.getOwnPropertyDescriptor(result, 'centerY')

      expect(centerXDescriptor?.value).toBe(0.5)
      expect(centerXDescriptor?.writable).toBe(true)
      expect(centerXDescriptor?.enumerable).toBe(true)
      expect(centerXDescriptor?.configurable).toBe(true)

      expect(centerYDescriptor?.value).toBe(0.3)
      expect(centerYDescriptor?.writable).toBe(true)
      expect(centerYDescriptor?.enumerable).toBe(true)
      expect(centerYDescriptor?.configurable).toBe(true)
    })

    test('calculateCropBoxFromCenter returns exact numeric precision', () => {
      const result = calculateCropBoxFromCenter(0.5, 0.5, 16/9, 9/16)

      // Exact floating-point precision validation
      expect(result.x).toBe(0.3418)
      expect(result.y).toBe(0)
      expect(result.width).toBe(0.3164)
      expect(result.height).toBe(1.0)

      // Validate exact toString representation
      expect(result.x.toString()).toBe('0.3418')
      expect(result.y.toString()).toBe('0')
      expect(result.width.toString()).toBe('0.3164')
      expect(result.height.toString()).toBe('1')
    })

    test('getTargetAspectRatio returns exact Number instance', () => {
      const result = getTargetAspectRatio()

      expect(typeof result).toBe('number')
      expect(result.constructor).toBe(Number) // Check constructor
      expect(Number.isFinite(result)).toBe(true)
      expect(Number.isNaN(result)).toBe(false)
    })
  })

  describe('Implementation-Specific Behavior Validation', () => {
    test('calculateCropBoxFromCenter ignores centerY parameter completely', () => {
      const result1 = calculateCropBoxFromCenter(0.5, 0, 16/9, 9/16)
      const result2 = calculateCropBoxFromCenter(0.5, 1, 16/9, 9/16)

      // Results should be identical regardless of centerY
      expect(result1.x).toBe(result2.x)
      expect(result1.y).toBe(result2.y)
      expect(result1.width).toBe(result2.width)
      expect(result1.height).toBe(result2.height)

      // Y should always be 0
      expect(result1.y).toBe(0)
      expect(result2.y).toBe(0)
    })

    test('calculateCropBoxFromCenter exact width calculation formula', () => {
      const centerX = 0.5
      const videoRatio = 16/9 // 1.7778
      const targetRatio = 9/16 // 0.5625

      const result = calculateCropBoxFromCenter(centerX, 0.5, videoRatio, targetRatio)

      // Exact formula: width = height * (targetRatio / videoRatio)
      // height = 1.0
      // width = 1.0 * (0.5625 / 1.7778) = 0.5625 / 1.7778
      const expectedWidth = targetRatio / videoRatio
      expect(result.width).toBeCloseTo(expectedWidth, 4)
      expect(result.width).toBe(0.3164)
    })

    test('extractCenters exact property extraction from window object', () => {
      const frame = createMockFrame({
        window: { focusX: 0.123, focusY: 0.456, scale: 0.789 }
      })

      const result = extractCenters(frame)

      // Exact extraction - should only use focusX and focusY
      expect(result.centerX).toBe(0.123)
      expect(result.centerY).toBe(0.456)

      // Should not extract scale or other properties
      expect(result).not.toHaveProperty('scale')
      expect(Object.keys(result)).toEqual(['centerX', 'centerY'])
    })

    test('createMockFrame exact spread operator behavior', () => {
      const baseFrame = createMockFrame()
      const override = { confidence: 0.95, time: 10.0 }
      const result = createMockFrame(override)

      // Exact spread behavior validation
      expect(result.confidence).toBe(0.95) // Overridden
      expect(result.time).toBe(10.0) // Overridden

      // Unchanged properties should remain exact
      expect(result.cropBox).toStrictEqual(baseFrame.cropBox)
      expect(result.window).toStrictEqual(baseFrame.window)
      expect(result.hasSceneChange).toBe(baseFrame.hasSceneChange)
      expect(result.metadata).toStrictEqual(baseFrame.metadata)
    })
  })
})
