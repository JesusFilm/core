/**
 * Face detection and tracking for auto-crop pipeline analysis pass
 */

import type {
  FaceDetection,
  FaceTrackingResults,
  FaceTrackingConfig,
  TrackedFace,
  PrimaryFaceCriteria
} from '../types/face-tracking'
import type { VideoMetadata } from '../types/video-metadata'
import type { ShotBoundary } from '../types/scene-detection'
import type { FrameMetadata } from '../types/decoding'
import { toDetectorBitmap, bitmapToImageData, cleanupDownscaledInputs } from './analysis/imageops'
import { FaceTracker, GlobalMotionEstimator, type TrackingROI, type TrackingInnovation } from './analysis/track'
import { AdaptiveCadenceScheduler, type CadenceDecision } from './analysis/scheduler'

/**
 * Face analysis session that manages detection cadence and tracking across shots
 */
export class FaceAnalysisSession {
  private trackedFaces: Map<string, TrackedFace> = new Map()
  private faceTrackers: Map<string, FaceTracker> = new Map()
  private primaryFaceHistory: Array<{
    timestamp: number
    primaryTrackId: string | null
    confidence: number
  }> = []
  private nextTrackId = 1
  private lastDetectionFrame = -1
  private config: FaceTrackingConfig

  // Adaptive cadence components
  private cadenceScheduler: AdaptiveCadenceScheduler
  private motionEstimator: GlobalMotionEstimator
  private currentCadence = 3 // Start with base cadence

  // Performance tracking
  private trackingStats = {
    totalDetections: 0,
    totalTrackingFrames: 0,
    averageCadence: 3,
    trackerHits: 0,
    trackerMisses: 0
  }

  constructor(config: FaceTrackingConfig) {
    this.config = config
    this.cadenceScheduler = new AdaptiveCadenceScheduler()
    this.motionEstimator = new GlobalMotionEstimator()
  }

  /**
   * Process a frame using adaptive cadence and tracker-first ROI approach
   */
  processFrame(
    frameIndex: number,
    timestamp: number,
    frameData: ImageData | VideoFrame,
    detector: (frame: ImageData | VideoFrame | ImageBitmap) => Promise<FaceDetection[]>,
    nearbyCuts?: ShotBoundary[]
  ): Promise<FaceDetection[]> {
    this.trackingStats.totalTrackingFrames++

    // Update global motion estimation for cadence decisions
    const motionEstimate = this.motionEstimator.estimateMotion(
      frameData instanceof ImageData ? frameData : this.frameToImageData(frameData)
    )

    // Get primary face innovation for cadence control
    const primaryTrackId = this.getPrimaryTrackId()
    const primaryTracker = primaryTrackId ? this.faceTrackers.get(primaryTrackId) : null
    const innovation = primaryTracker?.getState()?.innovations.slice(-1)[0]

    // Get adaptive cadence decision
    const cadenceDecision = this.cadenceScheduler.getNextCadence(
      frameIndex,
      innovation,
      motionEstimate || undefined,
      nearbyCuts
    )

    this.currentCadence = cadenceDecision.cadence
    this.trackingStats.averageCadence =
      (this.trackingStats.averageCadence * (this.trackingStats.totalTrackingFrames - 1) + this.currentCadence) /
      this.trackingStats.totalTrackingFrames

    // Determine if detection should run based on adaptive cadence
    const shouldDetect = this.shouldRunDetectionAdaptive(frameIndex)

    if (shouldDetect) {
      return this.detectAndTrackFacesAdaptive(frameIndex, timestamp, frameData, detector)
    } else {
      return this.trackFaces(frameIndex, timestamp, frameData)
    }
  }

  /**
   * Determine if detection should run on this frame (adaptive cadence)
   */
  private shouldRunDetectionAdaptive(frameIndex: number): boolean {
    return (frameIndex - this.lastDetectionFrame) >= this.currentCadence
  }

  /**
   * Get the current primary track ID
   */
  private getPrimaryTrackId(): string | null {
    if (this.primaryFaceHistory.length === 0) return null
    return this.primaryFaceHistory[this.primaryFaceHistory.length - 1].primaryTrackId
  }

  /**
   * Convert VideoFrame to ImageData (placeholder implementation)
   */
  private frameToImageData(frame: VideoFrame): ImageData {
    // This is a placeholder - actual implementation would depend on VideoFrame format
    // For now, return a minimal ImageData
    return new ImageData(1, 1)
  }

  /**
   * Run face detection and update tracks
   */
  private async detectAndTrackFaces(
    frameIndex: number,
    timestamp: number,
    frameData: ImageData | VideoFrame,
    detector: (frame: ImageData | VideoFrame | ImageBitmap) => Promise<FaceDetection[]>
  ): Promise<FaceDetection[]> {
    try {
      // Run detection
      const detections = await detector(frameData)
      this.lastDetectionFrame = frameIndex

      // Convert detections to FaceDetection format
      const faceDetections: FaceDetection[] = detections.map(detection => ({
        ...detection,
        timestamp
      }))

      // Update tracking
      this.updateTracks(faceDetections, timestamp)

      return faceDetections
    } catch (error) {
      console.warn(`Face detection failed at frame ${frameIndex}:`, error)
      return this.predictFaces(frameIndex, timestamp)
    }
  }

  /**
   * Predict face positions using tracker state
   */
  private predictFaces(frameIndex: number, timestamp: number): Promise<FaceDetection[]> {
    const predictions: FaceDetection[] = []

    // Predict positions for active tracks
    for (const [trackId, track] of this.trackedFaces) {
      if (track.state === 'active') {
        // Apply confidence decay
        const timeSinceLastSeen = timestamp - track.lastSeen
        const decayFactor = Math.pow(this.config.confidenceDecayRate, timeSinceLastSeen * 1000) // Assuming timestamps in seconds

        if (decayFactor > 0.1) { // Minimum confidence threshold
          // Use last detection for prediction (simple approach)
          const lastDetection = track.detections[track.detections.length - 1]
          if (lastDetection) {
            const predictedDetection: FaceDetection = {
              ...lastDetection,
              timestamp,
              confidence: lastDetection.confidence * decayFactor,
              id: `${trackId}_predicted_${frameIndex}`
            }
            predictions.push(predictedDetection)
          }
        } else {
          // Mark track as lost
          track.state = 'lost'
        }
      }
    }

    return Promise.resolve(predictions)
  }

  /**
   * Update tracks with new detections
   */
  private updateTracks(detections: FaceDetection[], timestamp: number): void {
    // Mark all tracks as not updated this frame
    for (const track of this.trackedFaces.values()) {
      if (track.state === 'active') {
        // Will be marked as lost if not updated
      }
    }

    // Correlate detections with existing tracks
    const unmatchedDetections = [...detections]
    const correlatedTracks = new Set<string>()

    // First pass: correlate with existing tracks
    for (const detection of detections) {
      let bestMatch: { trackId: string; score: number } | null = null

      for (const [trackId, track] of this.trackedFaces) {
        if (track.state !== 'active') continue
        if (correlatedTracks.has(trackId)) continue

        const score = this.calculateCorrelationScore(detection, track)
        if (score > 0.5 && (!bestMatch || score > bestMatch.score)) { // Correlation threshold
          bestMatch = { trackId, score }
        }
      }

      if (bestMatch) {
        this.updateTrack(bestMatch.trackId, detection, timestamp)
        correlatedTracks.add(bestMatch.trackId)
        const detectionIndex = unmatchedDetections.indexOf(detection)
        if (detectionIndex > -1) {
          unmatchedDetections.splice(detectionIndex, 1)
        }
      }
    }

    // Create new tracks for unmatched detections
    for (const detection of unmatchedDetections) {
      if (detection.confidence >= this.config.primaryFaceCriteria.minConfidence) {
        this.createNewTrack(detection, timestamp)
      }
    }

    // Clean up lost tracks
    this.cleanupLostTracks(timestamp)
  }

  /**
   * Calculate correlation score between detection and track
   */
  private calculateCorrelationScore(detection: FaceDetection, track: TrackedFace): number {
    const lastDetection = track.detections[track.detections.length - 1]
    if (!lastDetection) return 0

    // Distance score
    const center1 = {
      x: detection.box.x + detection.box.width / 2,
      y: detection.box.y + detection.box.height / 2
    }
    const center2 = {
      x: lastDetection.box.x + lastDetection.box.width / 2,
      y: lastDetection.box.y + lastDetection.box.height / 2
    }

    const distance = Math.sqrt(
      Math.pow(center1.x - center2.x, 2) + Math.pow(center1.y - center2.y, 2)
    )

    // Size similarity
    const area1 = detection.box.width * detection.box.height
    const area2 = lastDetection.box.width * lastDetection.box.height
    const sizeRatio = Math.min(area1, area2) / Math.max(area1, area2)

    // Combined score
    const distanceScore = Math.max(0, 1 - distance / 0.3) // Normalize by expected max distance
    const sizeScore = sizeRatio
    const confidenceScore = detection.confidence

    return (distanceScore * 0.4 + sizeScore * 0.3 + confidenceScore * 0.3)
  }

  /**
   * Update existing track with new detection
   */
  private updateTrack(trackId: string, detection: FaceDetection, timestamp: number): void {
    const track = this.trackedFaces.get(trackId)
    if (!track) return

    track.detections.push(detection)
    track.lastSeen = timestamp
    track.state = 'active'

    // Update metadata
    const totalTime = track.metadata.totalVisibleTime + (timestamp - track.lastSeen)
    const avgConfidence = track.detections.reduce((sum, d) => sum + d.confidence, 0) / track.detections.length

    track.metadata = {
      ...track.metadata,
      lastSeen: timestamp,
      totalVisibleTime: totalTime,
      avgConfidence,
      stabilityScore: this.calculateStabilityScore(track)
    }
  }

  /**
   * Create new track from detection
   */
  private createNewTrack(detection: FaceDetection, timestamp: number): void {
    const trackId = `face_${this.nextTrackId++}`
    const track: TrackedFace = {
      trackId,
      detections: [detection],
      metadata: {
        firstSeen: timestamp,
        lastSeen: timestamp,
        totalVisibleTime: 0,
        avgConfidence: detection.confidence,
        stabilityScore: 1.0
      },
      lastSeen: timestamp,
      state: 'active'
    }

    this.trackedFaces.set(trackId, track)
  }

  /**
   * Clean up tracks that have been lost for too long
   */
  private cleanupLostTracks(currentTime: number): void {
    for (const [trackId, track] of this.trackedFaces) {
      if (track.state === 'lost') {
        const timeSinceLost = currentTime - track.lastSeen
        if (timeSinceLost > 2.0) { // Terminate after 2 seconds lost
          track.state = 'terminated'
        }
      }
    }
  }

  /**
   * Calculate stability score for a track
   */
  private calculateStabilityScore(track: TrackedFace): number {
    if (track.detections.length < 2) return 1.0

    // Measure position stability over time
    let totalMovement = 0
    for (let i = 1; i < track.detections.length; i++) {
      const d1 = track.detections[i - 1]
      const d2 = track.detections[i]

      const center1 = {
        x: d1.box.x + d1.box.width / 2,
        y: d1.box.y + d1.box.height / 2
      }
      const center2 = {
        x: d2.box.x + d2.box.width / 2,
        y: d2.box.y + d2.box.height / 2
      }

      const movement = Math.sqrt(
        Math.pow(center1.x - center2.x, 2) + Math.pow(center1.y - center2.y, 2)
      )
      totalMovement += movement
    }

    const avgMovement = totalMovement / (track.detections.length - 1)
    // Lower movement = higher stability
    return Math.max(0, 1 - avgMovement / 0.1) // Normalize by expected movement
  }

  /**
   * Update primary face selection for adaptive tracking
   */
  private updatePrimaryFaceAdaptive(timestamp: number): void {
    const activeTracks = Array.from(this.trackedFaces.values())
      .filter(track => track.state === 'active')

    if (activeTracks.length === 0) {
      // No active tracks - record null primary face
      this.primaryFaceHistory.push({
        timestamp,
        primaryTrackId: null,
        confidence: 0
      })
      return
    }

    // Find primary face using scoring criteria
    let bestTrack: TrackedFace | null = null
    let bestScore = 0

    for (const track of activeTracks) {
      const score = this.calculatePrimaryScore(track)
      if (score > bestScore) {
        bestScore = score
        bestTrack = track
      }
    }

    if (!bestTrack) {
      this.primaryFaceHistory.push({
        timestamp,
        primaryTrackId: null,
        confidence: 0
      })
      return
    }

    // Record primary face selection
    const lastDetection = bestTrack.detections[bestTrack.detections.length - 1]
    if (lastDetection) {
      this.primaryFaceHistory.push({
        timestamp,
        primaryTrackId: bestTrack.trackId,
        confidence: lastDetection.confidence
      })
    } else {
      this.primaryFaceHistory.push({
        timestamp,
        primaryTrackId: bestTrack.trackId,
        confidence: 0.5 // Default confidence for tracked faces without recent detections
      })
    }
  }

  /**
   * Get primary face for current frame
   */
  getPrimaryFace(): FaceDetection | null {
    const activeTracks = Array.from(this.trackedFaces.values())
      .filter(track => track.state === 'active')

    if (activeTracks.length === 0) return null

    // Find primary face using scoring criteria
    let bestTrack: TrackedFace | null = null
    let bestScore = 0

    for (const track of activeTracks) {
      const score = this.calculatePrimaryScore(track)
      if (score > bestScore) {
        bestScore = score
        bestTrack = track
      }
    }

    if (!bestTrack) return null

    // Record primary face selection
    const lastDetection = bestTrack.detections[bestTrack.detections.length - 1]
    if (lastDetection) {
      this.primaryFaceHistory.push({
        timestamp: lastDetection.timestamp,
        primaryTrackId: bestTrack.trackId,
        confidence: lastDetection.confidence
      })
    }

    return lastDetection || null
  }

  /**
   * Calculate primary face score using the specified criteria
   */
  private calculatePrimaryScore(track: TrackedFace): number {
    const criteria = this.config.primaryFaceCriteria
    const lastDetection = track.detections[track.detections.length - 1]

    if (!lastDetection) return 0

    // Face area score
    const area = lastDetection.box.width * lastDetection.box.height
    const areaScore = area * criteria.areaWeight

    // Time on screen score
    const timeOnScreen = track.metadata.totalVisibleTime
    const timeScore = timeOnScreen * criteria.timeOnScreenWeight

    // Confidence score
    const confidenceScore = lastDetection.confidence * criteria.confidenceWeight

    return areaScore + timeScore + confidenceScore
  }

  /**
   * Handle shot boundary - reset trackers as specified in global plan
   */
  handleShotBoundary(shot: ShotBoundary): void {
    // Reset all trackers at shot boundaries to prevent pan across cuts
    for (const track of this.trackedFaces.values()) {
      if (track.state === 'active') {
        track.state = 'terminated'
      }
    }

    // Clear primary face history for new shot
    this.primaryFaceHistory = this.primaryFaceHistory.filter(
      entry => entry.timestamp < shot.startTime
    )
  }

  /**
   * Get final tracking results
   */
  getResults(): FaceTrackingResults {
    const tracks = Array.from(this.trackedFaces.values())

    // Calculate statistics
    const totalDetections = tracks.reduce((sum, track) => sum + track.detections.length, 0)
    const totalTracks = tracks.length
    const avgDetectionsPerFrame = totalDetections / Math.max(1, this.primaryFaceHistory.length)
    const primaryFaceSwitches = this.calculatePrimaryFaceSwitches()
    const avgTrackDuration = tracks.length > 0
      ? tracks.reduce((sum, track) => sum + track.metadata.totalVisibleTime, 0) / tracks.length
      : 0

    return {
      tracks,
      primaryFaceTimeline: this.primaryFaceHistory,
      stats: {
        totalDetections,
        totalTracks,
        avgDetectionsPerFrame,
        primaryFaceSwitches,
        avgTrackDuration
      }
    }
  }

  /**
   * Calculate number of primary face switches
   */
  private calculatePrimaryFaceSwitches(): number {
    let switches = 0
    let lastTrackId: string | null = null

    for (const entry of this.primaryFaceHistory) {
      if (entry.primaryTrackId !== lastTrackId) {
        switches++
        lastTrackId = entry.primaryTrackId
      }
    }

    return switches
  }

  /**
   * Run face detection with adaptive tracking integration
   */
  private async detectAndTrackFacesAdaptive(
    frameIndex: number,
    timestamp: number,
    frameData: ImageData | VideoFrame,
    detector: (frame: ImageData | VideoFrame | ImageBitmap) => Promise<FaceDetection[]>
  ): Promise<FaceDetection[]> {
    try {
      // Run detection
      const detections = await detector(frameData)
      this.lastDetectionFrame = frameIndex
      this.trackingStats.totalDetections++

      // Convert detections to FaceDetection format
      const faceDetections: FaceDetection[] = detections.map(detection => ({
        ...detection,
        timestamp
      }))

      // Update tracking with new detections
      this.updateTracksAdaptive(faceDetections, timestamp, frameData)

      return faceDetections
    } catch (error) {
      console.warn(`Face detection failed at frame ${frameIndex}:`, error)
      return this.trackFaces(frameIndex, timestamp, frameData)
    }
  }

  /**
   * Track faces using correlation/KLT within ROI (no detection)
   */
  private trackFaces(
    frameIndex: number,
    timestamp: number,
    frameData: ImageData | VideoFrame
  ): Promise<FaceDetection[]> {
    const predictions: FaceDetection[] = []

    // Track each active face using its dedicated tracker
    for (const [trackId, track] of this.trackedFaces) {
      if (track.state === 'active') {
        const tracker = this.faceTrackers.get(trackId)
        if (tracker && tracker.isActive()) {
          // Use tracker to predict face position
          const trackedROI = tracker.track(
            frameData instanceof ImageData ? frameData : this.frameToImageData(frameData),
            timestamp
          )

          if (trackedROI) {
            this.trackingStats.trackerHits++

            // Convert ROI to FaceDetection format
            const lastDetection = track.detections[track.detections.length - 1]
            if (lastDetection) {
              const predictedDetection: FaceDetection = {
                ...lastDetection,
                timestamp,
                confidence: trackedROI.confidence,
                box: {
                  x: trackedROI.x * (frameData instanceof ImageData ? frameData.width : 1920), // Assume 1920p if VideoFrame
                  y: trackedROI.y * (frameData instanceof ImageData ? frameData.height : 1080), // Assume 1080p if VideoFrame
                  width: trackedROI.width * (frameData instanceof ImageData ? frameData.width : 1920),
                  height: trackedROI.height * (frameData instanceof ImageData ? frameData.height : 1080)
                },
                id: `${trackId}_tracked_${frameIndex}`
              }
              predictions.push(predictedDetection)
            }
          } else {
            this.trackingStats.trackerMisses++
            // Tracker failed - mark as lost temporarily
            track.state = 'lost'
          }
        }
      }
    }

    return Promise.resolve(predictions)
  }

  /**
   * Update tracks with new detections and initialize/update trackers
   */
  private updateTracksAdaptive(
    detections: FaceDetection[],
    timestamp: number,
    frameData: ImageData | VideoFrame
  ): void {
    const frameImageData = frameData instanceof ImageData ? frameData : this.frameToImageData(frameData)

    // Mark all tracks as not updated this frame
    for (const track of this.trackedFaces.values()) {
      if (track.state === 'active') {
        // Will be marked as lost if not updated
      }
    }

    // Correlate detections with existing tracks
    const unmatchedDetections = [...detections]
    const correlatedTracks = new Set<string>()

    // First pass: correlate with existing tracks
    for (const detection of detections) {
      let bestMatch: { trackId: string; score: number } | null = null

      for (const [trackId, track] of this.trackedFaces) {
        if (track.state !== 'active') continue
        if (correlatedTracks.has(trackId)) continue

        const score = this.calculateCorrelationScore(detection, track)
        if (score > 0.5 && (!bestMatch || score > bestMatch.score)) { // Correlation threshold
          bestMatch = { trackId, score }
        }
      }

      if (bestMatch) {
        // Update existing track
        const track = this.trackedFaces.get(bestMatch.trackId)!
        track.detections.push(detection)
        track.lastSeen = timestamp
        track.metadata.lastSeen = timestamp
        track.metadata.totalVisibleTime += timestamp - track.metadata.firstSeen
        track.metadata.avgConfidence =
          track.detections.reduce((sum, d) => sum + d.confidence, 0) / track.detections.length

        // Update tracker with new detection
        const tracker = this.faceTrackers.get(bestMatch.trackId)
        if (tracker) {
          const roi: TrackingROI = {
            x: detection.box.x / frameImageData.width,
            y: detection.box.y / frameImageData.height,
            width: detection.box.width / frameImageData.width,
            height: detection.box.height / frameImageData.height,
            confidence: detection.confidence,
            lastUpdate: timestamp
          }
          tracker.updateWithDetection(frameImageData, roi)
        }

        correlatedTracks.add(bestMatch.trackId)
        unmatchedDetections.splice(unmatchedDetections.indexOf(detection), 1)
      }
    }

    // Second pass: create new tracks for unmatched detections
    for (const detection of unmatchedDetections) {
      const trackId = `track_${this.nextTrackId++}`
      const newTrack: TrackedFace = {
        trackId,
        detections: [detection],
        lastSeen: timestamp,
        metadata: {
          firstSeen: timestamp,
          lastSeen: timestamp,
          totalVisibleTime: 0,
          avgConfidence: detection.confidence,
          stabilityScore: 1.0
        },
        state: 'active'
      }

      this.trackedFaces.set(trackId, newTrack)

      // Initialize tracker for new track
      const tracker = new FaceTracker()
      const roi: TrackingROI = {
        x: detection.box.x / frameImageData.width,
        y: detection.box.y / frameImageData.height,
        width: detection.box.width / frameImageData.width,
        height: detection.box.height / frameImageData.height,
        confidence: detection.confidence,
        lastUpdate: timestamp
      }
      tracker.initialize(frameImageData, roi)
      this.faceTrackers.set(trackId, tracker)
    }

    // Mark uncorrelated tracks as lost
    for (const [trackId, track] of this.trackedFaces) {
      if (track.state === 'active' && !correlatedTracks.has(trackId)) {
        // Check if tracker can still provide predictions
        const tracker = this.faceTrackers.get(trackId)
        if (!tracker || !tracker.isActive()) {
          track.state = 'lost'
        }
      }
    }

    // Update primary face
    this.updatePrimaryFaceAdaptive(timestamp)
  }

  /**
   * Get tracking performance statistics
   */
  getTrackingStats() {
    return {
      ...this.trackingStats,
      schedulerStats: this.cadenceScheduler.getStats(),
      trackerCount: this.faceTrackers.size,
      activeTrackers: Array.from(this.faceTrackers.values()).filter(t => t.isActive()).length
    }
  }

  /**
   * Reset session for new analysis
   */
  reset(): void {
    this.trackedFaces.clear()
    this.faceTrackers.clear()
    this.primaryFaceHistory = []
    this.nextTrackId = 1
    this.lastDetectionFrame = -1
    this.cadenceScheduler.reset()
    this.motionEstimator.reset()
    this.currentCadence = 3
    this.trackingStats = {
      totalDetections: 0,
      totalTrackingFrames: 0,
      averageCadence: 3,
      trackerHits: 0,
      trackerMisses: 0
    }
  }
}

/**
 * Create face detector function using MediaPipe Tasks Vision
 * This would integrate with the existing MediaPipe setup in the cropper app
 */
export async function createFaceDetector(): Promise<(frame: ImageData | ImageBitmap) => Promise<FaceDetection[]>> {
  // This would integrate with the existing MediaPipe setup
  // For now, return a mock implementation
  return async (frame: ImageData | ImageBitmap): Promise<FaceDetection[]> => {
    // Mock face detection - in real implementation, this would use MediaPipe
    // The actual implementation would be similar to the existing detection.worker.ts
    console.warn('Face detector not fully implemented - using mock')

    // Return empty array for now - would be populated by actual MediaPipe detection
    return []
  }
}

/**
 * Run face analysis on a video segment
 */
export async function analyzeFacesInVideo(
  videoElement: HTMLVideoElement,
  metadata: VideoMetadata,
  shots: ShotBoundary[],
  config: FaceTrackingConfig,
  onProgress?: (progress: { frame: number; totalFrames: number }) => void
): Promise<FaceTrackingResults> {
  const detector = await createFaceDetector()
  const session = new FaceAnalysisSession(config)

  let totalFramesProcessed = 0

  // Process each shot
  for (const shot of shots) {
    session.handleShotBoundary(shot)

    const shotFrameCount = shot.endFrame - shot.startFrame + 1

    // Process frames in this shot
    for (let frameIndex = shot.startFrame; frameIndex <= shot.endFrame; frameIndex++) {
      const timestamp = frameIndex / metadata.fps

      // Seek to frame
      videoElement.currentTime = timestamp
      await waitForSeek(videoElement)

      // Capture frame
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Failed to get canvas context')

      canvas.width = videoElement.videoWidth
      canvas.height = videoElement.videoHeight
      ctx.drawImage(videoElement, 0, 0)

      const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Process frame
      await session.processFrame(frameIndex, timestamp, frameData, detector)

      totalFramesProcessed++
      onProgress?.({ frame: totalFramesProcessed, totalFrames: metadata.fps * metadata.duration })
    }
  }

  return session.getResults()
}

/**
 * Analyze faces in a stream of VideoFrames (WebCodecs path)
 */
export async function analyzeFacesInVideoStream(
  frameStream: AsyncIterable<{ frame: VideoFrame; metadata: FrameMetadata }>,
  metadata: VideoMetadata,
  shots: ShotBoundary[],
  config: FaceTrackingConfig,
  onProgress?: (progress: { frame: number; totalFrames: number }) => void
): Promise<FaceTrackingResults> {
  const detector = await createFaceDetector()
  const session = new FaceAnalysisSession(config)

  let totalFramesProcessed = 0
  const totalFrames = Math.floor(metadata.fps * metadata.duration)

  // Process each shot
  for (const shot of shots) {
    session.handleShotBoundary(shot)

    const shotFrameCount = shot.endFrame - shot.startFrame + 1

    // Process frames in this shot
    for await (const { frame, metadata: frameMetadata } of frameStream) {
      const frameIndex = frameMetadata.frameIndex
      const timestamp = frameMetadata.timestamp / 1000000 // Convert to seconds

      // Skip frames outside current shot
      if (frameIndex < shot.startFrame || frameIndex > shot.endFrame) {
        frame.close()
        continue
      }

      try {
        // Find nearby cuts for adaptive cadence
        const nearbyCuts = findNearbyCuts(shots, frameIndex, config.detectionCadence * 2)

        // Process frame with adaptive tracking
        await session.processFrame(frameIndex, timestamp, frame, async (frameData) => {
          // Convert VideoFrame to ImageData for detector
          return convertVideoFrameToDetections(frameData as VideoFrame, detector)
        }, nearbyCuts)

        totalFramesProcessed++
        onProgress?.({ frame: totalFramesProcessed, totalFrames })
      } finally {
        // Always close the frame after processing
        frame.close()
      }
    }
  }

  return session.getResults()
}

/**
 * Convert VideoFrame to face detections
 */
async function convertVideoFrameToDetections(
  frame: VideoFrame,
  detector: (frame: ImageData | VideoFrame | ImageBitmap) => Promise<FaceDetection[]>
): Promise<FaceDetection[]> {
  // Downscale VideoFrame to detector-sized ImageBitmap (320-360px short side)
  // This eliminates getImageData calls and uses GPU-accelerated downscaling
  const detectorBitmap = await toDetectorBitmap(frame)
  let gpuToCpuCopyMs = 0
  let detectorMs = 0

  try {
    const detectorStartTime = performance.now()

    // Pass ImageBitmap directly to detector (preferred) or convert to ImageData if needed
    if (detector.length === 1 && typeof detector === 'function') {
      // Try ImageBitmap first (zero GPU-to-CPU copy)
      try {
        const result = await detector(detectorBitmap)
        detectorMs = performance.now() - detectorStartTime
        return result
      } catch (error) {
        // Fallback to ImageData conversion if detector doesn't support ImageBitmap
        console.warn('Detector does not support ImageBitmap, falling back to ImageData conversion')
        const startTime = performance.now()
        const imageData = bitmapToImageData(detectorBitmap)
        gpuToCpuCopyMs = performance.now() - startTime
        const result = await detector(imageData)
        detectorMs = performance.now() - detectorStartTime
        return result
      }
    } else {
      // Legacy path: convert to ImageData
      const startTime = performance.now()
      const imageData = bitmapToImageData(detectorBitmap)
      gpuToCpuCopyMs = performance.now() - startTime
      const result = await detector(imageData)
      detectorMs = performance.now() - startTime
      return result
    }
  } finally {
    // Clean up the bitmap
    detectorBitmap.close()

    // Track performance metrics
    if (gpuToCpuCopyMs > 0) {
      console.debug(`GPU-to-CPU copy took ${gpuToCpuCopyMs.toFixed(2)}ms for frame`)
    }
    if (detectorMs > 0) {
      console.debug(`Face detector took ${detectorMs.toFixed(2)}ms for frame`)
    }
  }
}

/**
 * Find shot boundaries near the current frame for adaptive cadence control
 */
function findNearbyCuts(shots: ShotBoundary[], frameIndex: number, proximityFrames: number): ShotBoundary[] {
  return shots.filter(shot =>
    Math.abs(shot.startFrame - frameIndex) <= proximityFrames ||
    (frameIndex >= shot.startFrame && frameIndex <= shot.endFrame)
  )
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

