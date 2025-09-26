import type { DetectionResult, DetectionBox } from '../types'

export interface Track {
  id: string
  label: string
  firstSeen: number
  lastSeen: number
  lastUpdate: number
  position: DetectionBox
  velocity: { x: number; y: number; width: number; height: number }
  confidence: number
  hitCount: number
  missCount: number
  isActive: boolean
}

export interface TrackingConfig {
  maxDistance: number // Maximum distance (normalized 0-1) for correlation
  maxSizeDifference: number // Maximum size difference ratio for correlation
  maxMisses: number // Maximum consecutive misses before terminating track
  minConfidence: number // Minimum confidence for creating new tracks
  timeWindow: number // Time window (seconds) for velocity calculation
}

export const DEFAULT_TRACKING_CONFIG: TrackingConfig = {
  maxDistance: 0.15, // 15% of frame diagonal
  maxSizeDifference: 0.3, // 30% size difference allowed
  maxMisses: 5, // Terminate after 5 consecutive misses
  minConfidence: 0.3, // Minimum confidence for new tracks
  timeWindow: 2.0 // Use last 2 seconds for velocity
}

// Calculate Euclidean distance between centers of two bounding boxes
export function calculateBoxDistance(box1: DetectionBox, box2: DetectionBox): number {
  const center1X = box1.x + box1.width / 2
  const center1Y = box1.y + box1.height / 2
  const center2X = box2.x + box2.width / 2
  const center2Y = box2.y + box2.height / 2

  const dx = center2X - center1X
  const dy = center2Y - center1Y

  return Math.sqrt(dx * dx + dy * dy)
}

// Calculate size similarity (1.0 = identical size, 0.0 = very different)
export function calculateSizeSimilarity(box1: DetectionBox, box2: DetectionBox): number {
  const area1 = box1.width * box1.height
  const area2 = box2.width * box2.height

  if (area1 === 0 || area2 === 0) return 0

  const ratio = Math.min(area1, area2) / Math.max(area1, area2)
  return ratio
}

// Calculate correlation score between a detection and a track
export function calculateCorrelationScore(
  detection: DetectionResult,
  track: Track,
  config: TrackingConfig
): number {
  // Distance score (0-1, higher is better)
  const distance = calculateBoxDistance(detection.box, track.position)
  const distanceScore = Math.max(0, 1 - distance / config.maxDistance)

  // Size similarity score (0-1, higher is better)
  const sizeSimilarity = calculateSizeSimilarity(detection.box, track.position)
  const sizeScore = sizeSimilarity

  // Confidence score
  const confidenceScore = detection.confidence

  // Label matching bonus
  const labelBonus = detection.label === track.label ? 0.2 : 0

  // Combined score
  return (distanceScore * 0.4 + sizeScore * 0.3 + confidenceScore * 0.3) + labelBonus
}

export class TrackManager {
  private tracks: Map<string, Track> = new Map()
  private nextTrackId = 1
  private config: TrackingConfig

  constructor(config: Partial<TrackingConfig> = {}) {
    this.config = { ...DEFAULT_TRACKING_CONFIG, ...config }
  }

  // Process detections for a new frame
  processDetections(detections: DetectionResult[], currentTime: number): DetectionResult[] {
    // Reset all tracks for this frame
    for (const track of this.tracks.values()) {
      if (track.isActive) {
        track.isActive = false
      }
    }

    // Correlate detections with existing tracks
    const correlatedDetections: DetectionResult[] = []
    const availableDetections = [...detections]

    // Sort detections by confidence (highest first) for better matching
    availableDetections.sort((a, b) => b.confidence - a.confidence)

    // Try to match each detection to existing tracks
    for (const detection of availableDetections) {
      if (detection.confidence < this.config.minConfidence) {
        continue
      }

      let bestTrack: Track | null = null
      let bestScore = 0

      // Find best matching track
      for (const track of this.tracks.values()) {
        if (!track.isActive && track.missCount < this.config.maxMisses) {
          const score = calculateCorrelationScore(detection, track, this.config)
          if (score > bestScore && score > 0.3) { // Minimum correlation threshold
            bestScore = score
            bestTrack = track
          }
        }
      }

      if (bestTrack) {
        // Update existing track
        this.updateTrack(bestTrack, detection, currentTime)
        correlatedDetections.push({
          ...detection,
          trackId: bestTrack.id
        })
      } else {
        // Create new track
        const newTrack = this.createTrack(detection, currentTime)
        correlatedDetections.push({
          ...detection,
          trackId: newTrack.id
        })
      }
    }

    // Update miss counts for unmatched tracks
    for (const track of this.tracks.values()) {
      if (!track.isActive) {
        track.missCount++
        track.lastUpdate = currentTime
      }
    }

    // Clean up old tracks
    this.cleanupTracks(currentTime)

    return correlatedDetections
  }

  private createTrack(detection: DetectionResult, currentTime: number): Track {
    const trackId = `track-${this.nextTrackId++}`
    const track: Track = {
      id: trackId,
      label: detection.label,
      firstSeen: currentTime,
      lastSeen: currentTime,
      lastUpdate: currentTime,
      position: { ...detection.box },
      velocity: { x: 0, y: 0, width: 0, height: 0 },
      confidence: detection.confidence,
      hitCount: 1,
      missCount: 0,
      isActive: true
    }

    this.tracks.set(trackId, track)
    return track
  }

  private updateTrack(track: Track, detection: DetectionResult, currentTime: number): void {
    // Calculate velocity based on position change
    const timeDelta = currentTime - track.lastSeen
    if (timeDelta > 0 && timeDelta <= this.config.timeWindow) {
      track.velocity.x = (detection.box.x - track.position.x) / timeDelta
      track.velocity.y = (detection.box.y - track.position.y) / timeDelta
      track.velocity.width = (detection.box.width - track.position.width) / timeDelta
      track.velocity.height = (detection.box.height - track.position.height) / timeDelta
    }

    // Update track properties
    track.position = { ...detection.box }
    track.lastSeen = currentTime
    track.lastUpdate = currentTime
    track.confidence = detection.confidence
    track.hitCount++
    track.missCount = 0
    track.isActive = true
  }

  private cleanupTracks(currentTime: number): void {
    const tracksToRemove: string[] = []

    for (const [trackId, track] of this.tracks.entries()) {
      // Remove tracks that have been missing for too long
      if (track.missCount >= this.config.maxMisses) {
        tracksToRemove.push(trackId)
      }
      // Remove very old tracks (more than 10 seconds without updates)
      else if (currentTime - track.lastUpdate > 10) {
        tracksToRemove.push(trackId)
      }
    }

    for (const trackId of tracksToRemove) {
      this.tracks.delete(trackId)
    }
  }

  // Get all active tracks
  getActiveTracks(): Track[] {
    return Array.from(this.tracks.values()).filter(track => track.isActive)
  }

  // Get all tracks
  getAllTracks(): Track[] {
    return Array.from(this.tracks.values())
  }

  // Get track by ID
  getTrack(trackId: string): Track | undefined {
    return this.tracks.get(trackId)
  }

  // Reset tracking state
  reset(): void {
    this.tracks.clear()
    this.nextTrackId = 1
  }

  // Update configuration
  updateConfig(config: Partial<TrackingConfig>): void {
    this.config = { ...this.config, ...config }
  }
}
