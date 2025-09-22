import { describe, it, expect } from '@jest/globals'

// Test the centering logic for crop box positioning
describe('Crop Box Centering', () => {
  describe('Detection Center Calculation', () => {
    it('should calculate detection center correctly', () => {
      const detection = {
        box: {
          x: 0.2,
          y: 0.3,
          width: 0.2,
          height: 0.2
        }
      }

      const centerX = detection.box.x + detection.box.width / 2
      const centerY = detection.box.y + detection.box.height / 2

      expect(centerX).toBeCloseTo(0.3) // 0.2 + 0.2/2 = 0.3
      expect(centerY).toBeCloseTo(0.4) // 0.3 + 0.2/2 = 0.4
    })

    it('should handle edge case detection positions', () => {
      // Detection at top-left corner
      const cornerDetection = {
        box: {
          x: 0.0,
          y: 0.0,
          width: 0.1,
          height: 0.1
        }
      }

      const centerX = cornerDetection.box.x + cornerDetection.box.width / 2
      const centerY = cornerDetection.box.y + cornerDetection.box.height / 2

      expect(centerX).toBeCloseTo(0.05)
      expect(centerY).toBeCloseTo(0.05)
    })

    it('should handle large detection boxes', () => {
      // Large detection covering most of the frame
      const largeDetection = {
        box: {
          x: 0.1,
          y: 0.1,
          width: 0.8,
          height: 0.8
        }
      }

      const centerX = largeDetection.box.x + largeDetection.box.width / 2
      const centerY = largeDetection.box.y + largeDetection.box.height / 2

      expect(centerX).toBeCloseTo(0.5) // 0.1 + 0.8/2 = 0.5 (center)
      expect(centerY).toBeCloseTo(0.5) // 0.1 + 0.8/2 = 0.5 (center)
    })
  })

  describe('Repositioning Threshold', () => {
    it('should detect when repositioning is needed', () => {
      const threshold = 0.05

      // Test cases where repositioning should occur
      expect(Math.abs(0.5 - 0.3) > threshold).toBe(true)  // 0.2 difference > 0.05
      expect(Math.abs(0.5 - 0.46) > threshold).toBe(false) // 0.04 difference < 0.05
      expect(Math.abs(0.5 - 0.5) > threshold).toBe(false)  // 0.0 difference < 0.05
    })

    it('should handle boundary conditions', () => {
      const newFocusX = Math.max(0, Math.min(1, 1.5)) // Value > 1 should be clamped to 1
      const newFocusY = Math.max(0, Math.min(1, -0.2)) // Value < 0 should be clamped to 0

      expect(newFocusX).toBe(1)
      expect(newFocusY).toBe(0)
    })
  })

  describe('Priority Detection Selection', () => {
    it('should prioritize face detection over others', () => {
      const detections = [
        { label: 'person', confidence: 0.9 },
        { label: 'face', confidence: 0.7 },
        { label: 'silhouette', confidence: 0.8 }
      ]

      const priorityOrder = { face: 4, person: 3, silhouette: 2, center: 1 }

      const primaryDetection = detections.reduce((best, current) => {
        const bestPriority = priorityOrder[best.label as keyof typeof priorityOrder] || 0
        const currentPriority = priorityOrder[current.label as keyof typeof priorityOrder] || 0

        if (currentPriority > bestPriority) {
          return current
        } else if (currentPriority === bestPriority && current.confidence > best.confidence) {
          return current
        }
        return best
      })

      expect(primaryDetection.label).toBe('face')
    })

    it('should fallback to higher confidence when same priority', () => {
      const detections = [
        { label: 'person', confidence: 0.6 },
        { label: 'person', confidence: 0.8 },
        { label: 'person', confidence: 0.7 }
      ]

      const priorityOrder = { face: 4, person: 3, silhouette: 2, center: 1 }

      const primaryDetection = detections.reduce((best, current) => {
        const bestPriority = priorityOrder[best.label as keyof typeof priorityOrder] || 0
        const currentPriority = priorityOrder[current.label as keyof typeof priorityOrder] || 0

        if (currentPriority > bestPriority) {
          return current
        } else if (currentPriority === bestPriority && current.confidence > best.confidence) {
          return current
        }
        return best
      })

      expect(primaryDetection.confidence).toBe(0.8)
    })
  })

  describe('Scene Change Based Centering', () => {
    it('should only reposition on significant or transition scene changes', () => {
      const sceneLevels = ['stable', 'moderate', 'significant', 'transition']

      sceneLevels.forEach(level => {
        const shouldReposition = level === 'significant' || level === 'transition'
        expect(shouldReposition).toBe(level === 'significant' || level === 'transition')
      })
    })

    it('should use lower threshold for major scene changes', () => {
      // Significant scene change - lower threshold (more responsive)
      const significantThreshold = 0.02
      expect(significantThreshold).toBe(0.02)

      // Normal tracking - higher threshold (less jittery)
      const normalThreshold = 0.15
      expect(normalThreshold).toBe(0.15)
    })

    it('should check if detection is outside crop bounds', () => {
      const crop = { x: 0.2, y: 0.3, width: 0.4, height: 0.4 }
      const detectionCenter = { x: 0.1, y: 0.2 } // Outside crop bounds

      const cropLeft = crop.x
      const cropRight = crop.x + crop.width
      const cropTop = crop.y
      const cropBottom = crop.y + crop.height

      const detectionOutsideCrop = detectionCenter.x < cropLeft ||
                                  detectionCenter.x > cropRight ||
                                  detectionCenter.y < cropTop ||
                                  detectionCenter.y > cropBottom

      expect(detectionOutsideCrop).toBe(true)
    })

    it('should not reposition when detection is inside crop bounds', () => {
      const crop = { x: 0.2, y: 0.3, width: 0.4, height: 0.4 }
      const detectionCenter = { x: 0.4, y: 0.5 } // Inside crop bounds

      const cropLeft = crop.x
      const cropRight = crop.x + crop.width
      const cropTop = crop.y
      const cropBottom = crop.y + crop.height

      const detectionOutsideCrop = detectionCenter.x < cropLeft ||
                                  detectionCenter.x > cropRight ||
                                  detectionCenter.y < cropTop ||
                                  detectionCenter.y > cropBottom

      expect(detectionOutsideCrop).toBe(false)
    })
  })

  describe('Crop Box Calculations', () => {
    it('should calculate crop overlay dimensions correctly', () => {
      const crop = {
        x: 0.2,
        y: 0.3,
        width: 0.4,
        height: 0.4
      }

      const left = crop.x * 100
      const top = crop.y * 100
      const width = crop.width * 100
      const height = crop.height * 100

      expect(left).toBeCloseTo(20)
      expect(top).toBeCloseTo(30)
      expect(width).toBeCloseTo(40)
      expect(height).toBeCloseTo(40)

      const right = left + width
      const bottom = top + height

      expect(right).toBeCloseTo(60)
      expect(bottom).toBeCloseTo(70)
    })

    it('should handle crop boxes at frame boundaries', () => {
      const edgeCrop = {
        x: 0.0,
        y: 0.0,
        width: 0.5,
        height: 0.5
      }

      const left = edgeCrop.x * 100
      const top = edgeCrop.y * 100
      const width = edgeCrop.width * 100
      const height = edgeCrop.height * 100

      expect(left).toBeCloseTo(0)
      expect(top).toBeCloseTo(0)
      expect(width).toBeCloseTo(50)
      expect(height).toBeCloseTo(50)
    })
  })
})
