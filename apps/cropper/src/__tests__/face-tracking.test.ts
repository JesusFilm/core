import { TrackManager, calculateBoxDistance, calculateSizeSimilarity, calculateCorrelationScore } from '../lib/face-tracking'
import type { DetectionResult } from '../types'

describe('Face Tracking', () => {
  describe('calculateBoxDistance', () => {
    it('should calculate distance between box centers', () => {
      const box1 = { x: 0.1, y: 0.1, width: 0.1, height: 0.1 }
      const box2 = { x: 0.2, y: 0.2, width: 0.1, height: 0.1 }

      const distance = calculateBoxDistance(box1, box2)
      // Distance between centers (0.15, 0.15) and (0.25, 0.25)
      expect(distance).toBeCloseTo(0.1414, 3) // sqrt((0.1)^2 + (0.1)^2)
    })

    it('should return 0 for identical boxes', () => {
      const box1 = { x: 0.1, y: 0.1, width: 0.1, height: 0.1 }
      const distance = calculateBoxDistance(box1, box1)
      expect(distance).toBe(0)
    })
  })

  describe('calculateSizeSimilarity', () => {
    it('should return 1.0 for identical sizes', () => {
      const box1 = { x: 0, y: 0, width: 0.1, height: 0.1 }
      const similarity = calculateSizeSimilarity(box1, box1)
      expect(similarity).toBe(1.0)
    })

    it('should calculate similarity correctly', () => {
      const box1 = { x: 0, y: 0, width: 0.1, height: 0.1 } // area = 0.01
      const box2 = { x: 0, y: 0, width: 0.2, height: 0.05 } // area = 0.01
      const similarity = calculateSizeSimilarity(box1, box2)
      expect(similarity).toBe(1.0) // Same area
    })

    it('should return less than 1.0 for different sizes', () => {
      const box1 = { x: 0, y: 0, width: 0.1, height: 0.1 } // area = 0.01
      const box2 = { x: 0, y: 0, width: 0.2, height: 0.2 } // area = 0.04
      const similarity = calculateSizeSimilarity(box1, box2)
      expect(similarity).toBe(0.25) // min/max = 0.01/0.04 = 0.25
    })
  })

  describe('calculateCorrelationScore', () => {
    it('should calculate correlation score between detection and track', () => {
      const detection: DetectionResult = {
        id: 'det-1',
        trackId: '',
        time: 1.0,
        box: { x: 0.1, y: 0.1, width: 0.1, height: 0.1 },
        confidence: 0.9,
        label: 'face',
        source: 'mediapipe'
      }

      const track = {
        id: 'track-1',
        label: 'face',
        firstSeen: 0,
        lastSeen: 0.5,
        lastUpdate: 0.5,
        position: { x: 0.1, y: 0.1, width: 0.1, height: 0.1 },
        velocity: { x: 0, y: 0, width: 0, height: 0 },
        confidence: 0.8,
        hitCount: 1,
        missCount: 0,
        isActive: true
      }

      const score = calculateCorrelationScore(detection, track, { maxDistance: 0.15, maxSizeDifference: 0.3, maxMisses: 5, minConfidence: 0.3, timeWindow: 2.0 })
      expect(score).toBeGreaterThan(0.5) // Should be a good match
    })
  })

  describe('TrackManager', () => {
    let manager: TrackManager

    beforeEach(() => {
      manager = new TrackManager()
    })

    it('should create new tracks for detections', () => {
      const detections: DetectionResult[] = [
        {
          id: 'det-1',
          trackId: '',
          time: 1.0,
          box: { x: 0.1, y: 0.1, width: 0.1, height: 0.1 },
          confidence: 0.9,
          label: 'face',
          source: 'mediapipe'
        }
      ]

      const correlated = manager.processDetections(detections, 1.0)

      expect(correlated).toHaveLength(1)
      expect(correlated[0].trackId).toMatch(/^track-\d+$/)
      expect(manager.getAllTracks()).toHaveLength(1)
    })

    it('should correlate same face across frames', () => {
      // First frame
      const detections1: DetectionResult[] = [
        {
          id: 'det-1',
          trackId: '',
          time: 1.0,
          box: { x: 0.1, y: 0.1, width: 0.1, height: 0.1 },
          confidence: 0.9,
          label: 'face',
          source: 'mediapipe'
        }
      ]

      // Second frame - slightly moved
      const detections2: DetectionResult[] = [
        {
          id: 'det-2',
          trackId: '',
          time: 2.0,
          box: { x: 0.12, y: 0.12, width: 0.1, height: 0.1 },
          confidence: 0.9,
          label: 'face',
          source: 'mediapipe'
        }
      ]

      const correlated1 = manager.processDetections(detections1, 1.0)
      const correlated2 = manager.processDetections(detections2, 2.0)

      expect(correlated1[0].trackId).toBe(correlated2[0].trackId)
      expect(manager.getAllTracks()).toHaveLength(1)
    })

    it('should create separate tracks for different faces', () => {
      const detections: DetectionResult[] = [
        {
          id: 'det-1',
          trackId: '',
          time: 1.0,
          box: { x: 0.1, y: 0.1, width: 0.1, height: 0.1 },
          confidence: 0.9,
          label: 'face',
          source: 'mediapipe'
        },
        {
          id: 'det-2',
          trackId: '',
          time: 1.0,
          box: { x: 0.8, y: 0.8, width: 0.1, height: 0.1 },
          confidence: 0.9,
          label: 'face',
          source: 'mediapipe'
        }
      ]

      const correlated = manager.processDetections(detections, 1.0)

      expect(correlated).toHaveLength(2)
      expect(correlated[0].trackId).not.toBe(correlated[1].trackId)
      expect(manager.getAllTracks()).toHaveLength(2)
    })

    it('should handle track termination after misses', () => {
      // Create a track
      const detections1: DetectionResult[] = [
        {
          id: 'det-1',
          trackId: '',
          time: 1.0,
          box: { x: 0.1, y: 0.1, width: 0.1, height: 0.1 },
          confidence: 0.9,
          label: 'face',
          source: 'mediapipe'
        }
      ]

      manager.processDetections(detections1, 1.0)
      expect(manager.getAllTracks()).toHaveLength(1)

      // Simulate 6 consecutive misses (maxMisses = 5)
      for (let i = 0; i < 6; i++) {
        manager.processDetections([], 2.0 + i)
      }

      // Track should be terminated
      expect(manager.getAllTracks()).toHaveLength(0)
    })
  })
})
