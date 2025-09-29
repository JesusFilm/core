/**
 * Face tracker with innovation metrics and ROI-based correlation tracking
 * Implements adaptive tracking between detector hits for optimal performance
 */

export interface TrackingROI {
  /** Region of interest coordinates (normalized 0-1) */
  x: number
  y: number
  width: number
  height: number
  /** Confidence in this ROI (0-1) */
  confidence: number
  /** Timestamp of last update */
  lastUpdate: number
}

export interface TrackingInnovation {
  /** Innovation score (0-1, higher = more motion/change) */
  score: number
  /** Position innovation (pixels) */
  positionDelta: number
  /** Size innovation (relative scale change) */
  sizeDelta: number
  /** Confidence innovation (confidence change) */
  confidenceDelta: number
  /** Timestamp */
  timestamp: number
}

export interface TrackerState {
  /** Current ROI */
  roi: TrackingROI
  /** Recent innovation history */
  innovations: TrackingInnovation[]
  /** Track stability score (0-1) */
  stability: number
  /** Frames since last detection update */
  framesSinceDetection: number
  /** Current tracking confidence */
  confidence: number
}

export interface CorrelationResult {
  /** Correlation score (0-1, higher = better match) */
  score: number
  /** Best matching position offset */
  offsetX: number
  offsetY: number
  /** Peak correlation value */
  peakValue: number
}

export interface GlobalMotionEstimate {
  /** Global motion vector (pixels) */
  motionX: number
  motionY: number
  /** Motion confidence (0-1) */
  confidence: number
  /** Motion magnitude */
  magnitude: number
  /** Timestamp */
  timestamp: number
}

export class FaceTracker {
  private state: TrackerState | null = null
  private template: ImageData | null = null
  private prevFrame: ImageData | null = null
  private config: TrackerConfig

  constructor(config: TrackerConfig = DEFAULT_TRACKER_CONFIG) {
    this.config = config
  }

  /**
   * Initialize tracker with first detection
   */
  initialize(frame: ImageData | VideoFrame, roi: TrackingROI): void {
    this.state = {
      roi: { ...roi },
      innovations: [],
      stability: 1.0,
      framesSinceDetection: 0,
      confidence: roi.confidence
    }

    // Extract template from ROI
    this.template = this.extractTemplate(frame, roi)
    this.prevFrame = this.frameToImageData(frame)
  }

  /**
   * Update tracker with new detection (resets tracking state)
   */
  updateWithDetection(frame: ImageData | VideoFrame, roi: TrackingROI): TrackingInnovation {
    if (!this.state) {
      this.initialize(frame, roi)
      return {
        score: 0,
        positionDelta: 0,
        sizeDelta: 0,
        confidenceDelta: 0,
        timestamp: roi.lastUpdate
      }
    }

    const prevROI = this.state.roi
    const innovation = this.calculateInnovation(prevROI, roi)

    // Update state
    this.state.roi = { ...roi }
    this.state.confidence = roi.confidence
    this.state.framesSinceDetection = 0
    this.state.innovations.push(innovation)

    // Keep only recent innovations
    if (this.state.innovations.length > this.config.innovationHistorySize) {
      this.state.innovations.shift()
    }

    // Update template
    this.template = this.extractTemplate(frame, roi)
    this.prevFrame = this.frameToImageData(frame)

    // Update stability based on innovation pattern
    this.updateStability()

    return innovation
  }

  /**
   * Track face in new frame using correlation
   */
  track(frame: ImageData | VideoFrame, timestamp: number): TrackingROI | null {
    if (!this.state || !this.template) {
      return null
    }

    const frameData = this.frameToImageData(frame)
    const currentROI = this.state.roi

    // Perform correlation tracking within search region
    const correlation = this.correlateTemplate(frameData, currentROI)

    if (correlation.score < this.config.minCorrelationThreshold) {
      // Tracking failed
      this.state.confidence *= this.config.confidenceDecayRate
      this.state.framesSinceDetection++

      // Create innovation for failed tracking
      const failedInnovation: TrackingInnovation = {
        score: 1.0, // High innovation = tracking uncertainty
        positionDelta: 0,
        sizeDelta: 0,
        confidenceDelta: -this.state.confidence * (1 - this.config.confidenceDecayRate),
        timestamp
      }

      this.state.innovations.push(failedInnovation)
      if (this.state.innovations.length > this.config.innovationHistorySize) {
        this.state.innovations.shift()
      }

      this.updateStability()

      // Return predicted ROI if confidence is still reasonable
      if (this.state.confidence > this.config.minTrackingConfidence) {
        return {
          ...currentROI,
          confidence: this.state.confidence,
          lastUpdate: timestamp
        }
      }

      return null // Tracking lost
    }

    // Update ROI based on correlation result
    const newROI: TrackingROI = {
      x: Math.max(0, Math.min(1 - currentROI.width,
        currentROI.x + (correlation.offsetX / frameData.width))),
      y: Math.max(0, Math.min(1 - currentROI.height,
        currentROI.y + (correlation.offsetY / frameData.height))),
      width: currentROI.width,
      height: currentROI.height,
      confidence: correlation.score * this.state.confidence,
      lastUpdate: timestamp
    }

    // Calculate innovation
    const innovation = this.calculateInnovation(currentROI, newROI)
    this.state.innovations.push(innovation)
    if (this.state.innovations.length > this.config.innovationHistorySize) {
      this.state.innovations.shift()
    }

    // Update state
    this.state.roi = newROI
    this.state.framesSinceDetection++
    this.updateStability()

    // Apply confidence decay for predicted frames
    this.state.confidence *= this.config.confidenceDecayRate

    return newROI
  }

  /**
   * Get current innovation score (average of recent innovations)
   */
  getInnovationScore(): number {
    if (!this.state || this.state.innovations.length === 0) {
      return 0
    }

    const recentInnovations = this.state.innovations.slice(-this.config.innovationWindowSize)
    return recentInnovations.reduce((sum, inn) => sum + inn.score, 0) / recentInnovations.length
  }

  /**
   * Get current tracker state
   */
  getState(): TrackerState | null {
    return this.state ? { ...this.state } : null
  }

  /**
   * Check if tracker is active and confident
   */
  isActive(): boolean {
    return this.state !== null &&
           this.state.confidence > this.config.minTrackingConfidence &&
           this.state.framesSinceDetection < this.config.maxPredictionFrames
  }

  /**
   * Reset tracker
   */
  reset(): void {
    this.state = null
    this.template = null
    this.prevFrame = null
  }

  /**
   * Extract template from ROI for correlation tracking
   */
  private extractTemplate(frame: ImageData | VideoFrame, roi: TrackingROI): ImageData {
    const frameData = this.frameToImageData(frame)
    const { width, height } = frameData

    const roiX = Math.floor(roi.x * width)
    const roiY = Math.floor(roi.y * height)
    const roiWidth = Math.floor(roi.width * width)
    const roiHeight = Math.floor(roi.height * height)

    // Create template ImageData
    const template = new ImageData(roiWidth, roiHeight)
    const templateData = template.data
    const frameDataArray = frameData.data

    for (let y = 0; y < roiHeight; y++) {
      for (let x = 0; x < roiWidth; x++) {
        const frameIndex = ((roiY + y) * width + (roiX + x)) * 4
        const templateIndex = (y * roiWidth + x) * 4

        templateData[templateIndex] = frameDataArray[frameIndex]     // R
        templateData[templateIndex + 1] = frameDataArray[frameIndex + 1] // G
        templateData[templateIndex + 2] = frameDataArray[frameIndex + 2] // B
        templateData[templateIndex + 3] = frameDataArray[frameIndex + 3] // A
      }
    }

    return template
  }

  /**
   * Perform normalized cross-correlation between template and search region
   */
  private correlateTemplate(frameData: ImageData, roi: TrackingROI): CorrelationResult {
    const { width, height } = frameData
    const searchRegion = this.config.searchRegionSize

    const roiX = Math.floor(roi.x * width)
    const roiY = Math.floor(roi.y * height)
    const roiWidth = Math.floor(roi.width * width)
    const roiHeight = Math.floor(roi.height * height)

    // Define search region bounds
    const searchLeft = Math.max(0, roiX - Math.floor(searchRegion * roiWidth))
    const searchTop = Math.max(0, roiY - Math.floor(searchRegion * roiHeight))
    const searchRight = Math.min(width - roiWidth, roiX + Math.floor(searchRegion * roiWidth))
    const searchBottom = Math.min(height - roiHeight, roiY + Math.floor(searchRegion * roiHeight))

    let bestScore = 0
    let bestOffsetX = 0
    let bestOffsetY = 0

    // Slide template over search region
    for (let y = searchTop; y <= searchBottom; y++) {
      for (let x = searchLeft; x <= searchRight; x++) {
        const score = this.computeNormalizedCorrelation(frameData, this.template!, x, y)

        if (score > bestScore) {
          bestScore = score
          bestOffsetX = x - roiX
          bestOffsetY = y - roiY
        }
      }
    }

    return {
      score: bestScore,
      offsetX: bestOffsetX,
      offsetY: bestOffsetY,
      peakValue: bestScore
    }
  }

  /**
   * Compute normalized cross-correlation at specific position
   */
  private computeNormalizedCorrelation(
    frameData: ImageData,
    template: ImageData,
    frameX: number,
    frameY: number
  ): number {
    const { width: frameWidth } = frameData
    const { width: templateWidth, height: templateHeight, data: templateData } = template

    let sumFF = 0 // Sum of frame^2
    let sumTT = 0 // Sum of template^2
    let sumFT = 0 // Sum of frame*template

    for (let y = 0; y < templateHeight; y++) {
      for (let x = 0; x < templateWidth; x++) {
        const frameIndex = ((frameY + y) * frameWidth + (frameX + x)) * 4
        const templateIndex = (y * templateWidth + x) * 4

        // Convert to grayscale for correlation (luminance)
        const frameLum = 0.299 * frameData.data[frameIndex] +
                        0.587 * frameData.data[frameIndex + 1] +
                        0.114 * frameData.data[frameIndex + 2]
        const templateLum = 0.299 * templateData[templateIndex] +
                           0.587 * templateData[templateIndex + 1] +
                           0.114 * templateData[templateIndex + 2]

        sumFF += frameLum * frameLum
        sumTT += templateLum * templateLum
        sumFT += frameLum * templateLum
      }
    }

    // Avoid division by zero
    if (sumFF === 0 || sumTT === 0) {
      return 0
    }

    return sumFT / Math.sqrt(sumFF * sumTT)
  }

  /**
   * Calculate innovation between two ROIs
   */
  private calculateInnovation(oldROI: TrackingROI, newROI: TrackingROI): TrackingInnovation {
    const positionDelta = Math.sqrt(
      Math.pow((newROI.x - oldROI.x) * 100, 2) + // Convert to pixel scale approximation
      Math.pow((newROI.y - oldROI.y) * 100, 2)
    )

    const sizeDelta = Math.abs(newROI.width - oldROI.width) + Math.abs(newROI.height - oldROI.height)
    const confidenceDelta = newROI.confidence - oldROI.confidence

    // Innovation score combines position, size, and confidence changes
    const score = Math.min(1.0, (
      positionDelta / this.config.maxExpectedMotion +
      sizeDelta * 10 + // Size changes are more significant
      Math.abs(confidenceDelta)
    ) / 3)

    return {
      score,
      positionDelta,
      sizeDelta,
      confidenceDelta,
      timestamp: newROI.lastUpdate
    }
  }

  /**
   * Update stability score based on innovation history
   */
  private updateStability(): void {
    if (!this.state) return

    const innovations = this.state.innovations
    if (innovations.length < 2) {
      this.state.stability = 1.0
      return
    }

    // Calculate variance in innovation scores (lower variance = higher stability)
    const scores = innovations.map(inn => inn.score)
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length

    // Convert variance to stability score (0-1)
    this.state.stability = Math.max(0, Math.min(1, 1 - variance * 4))
  }

  /**
   * Convert frame to ImageData
   */
  private frameToImageData(frame: ImageData | VideoFrame): ImageData {
    if (frame instanceof ImageData) {
      return frame
    }

    // For VideoFrame, we'd need to convert to ImageData
    // This is a placeholder - actual implementation would depend on the VideoFrame format
    throw new Error('VideoFrame to ImageData conversion not implemented')
  }
}

/**
 * Global motion estimator using block matching
 */
export class GlobalMotionEstimator {
  private prevFrame: ImageData | null = null
  private config: MotionConfig

  constructor(config: MotionConfig = DEFAULT_MOTION_CONFIG) {
    this.config = config
  }

  /**
   * Estimate global motion between current and previous frame
   */
  estimateMotion(frame: ImageData): GlobalMotionEstimate | null {
    if (!this.prevFrame) {
      this.prevFrame = new ImageData(
        new Uint8ClampedArray(frame.data),
        frame.width,
        frame.height
      )
      return null
    }

    // Downscale to 160p for motion estimation
    const downscaled = this.downscaleFrame(frame, 160)
    const prevDownscaled = this.downscaleFrame(this.prevFrame, 160)

    // Perform block matching
    const motionVectors = this.blockMatching(prevDownscaled, downscaled)

    // Aggregate motion vectors to estimate global motion
    const globalMotion = this.aggregateMotionVectors(motionVectors, downscaled.width, downscaled.height)

    // Update previous frame
    this.prevFrame = new ImageData(
      new Uint8ClampedArray(frame.data),
      frame.width,
      frame.height
    )

    return globalMotion
  }

  /**
   * Downscale frame to target height while maintaining aspect ratio
   */
  private downscaleFrame(frame: ImageData, targetHeight: number): ImageData {
    const scale = targetHeight / frame.height
    const targetWidth = Math.floor(frame.width * scale)

    const downscaled = new ImageData(targetWidth, targetHeight)
    const sourceData = frame.data
    const targetData = downscaled.data

    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const sourceX = Math.floor(x / scale)
        const sourceY = Math.floor(y / scale)
        const sourceIndex = (sourceY * frame.width + sourceX) * 4
        const targetIndex = (y * targetWidth + x) * 4

        targetData[targetIndex] = sourceData[sourceIndex]
        targetData[targetIndex + 1] = sourceData[sourceIndex + 1]
        targetData[targetIndex + 2] = sourceData[sourceIndex + 2]
        targetData[targetIndex + 3] = sourceData[sourceIndex + 3]
      }
    }

    return downscaled
  }

  /**
   * Perform block matching between frames
   */
  private blockMatching(prevFrame: ImageData, currFrame: ImageData): Array<{x: number, y: number, dx: number, dy: number}> {
    const { width, height } = prevFrame
    const blockSize = this.config.blockSize
    const searchRange = this.config.searchRange

    const vectors: Array<{x: number, y: number, dx: number, dy: number}> = []

    for (let y = 0; y < height - blockSize; y += blockSize) {
      for (let x = 0; x < width - blockSize; x += blockSize) {
        const bestMatch = this.findBestMatch(prevFrame, currFrame, x, y, blockSize, searchRange)
        vectors.push({
          x, y,
          dx: bestMatch.dx,
          dy: bestMatch.dy
        })
      }
    }

    return vectors
  }

  /**
   * Find best matching block within search range
   */
  private findBestMatch(
    prevFrame: ImageData,
    currFrame: ImageData,
    blockX: number,
    blockY: number,
    blockSize: number,
    searchRange: number
  ): { dx: number, dy: number, score: number } {
    let bestDx = 0
    let bestDy = 0
    let bestScore = -1

    for (let dy = -searchRange; dy <= searchRange; dy++) {
      for (let dx = -searchRange; dx <= searchRange; dx++) {
        const score = this.blockSimilarity(prevFrame, currFrame, blockX, blockY, blockX + dx, blockY + dy, blockSize)

        if (score > bestScore) {
          bestScore = score
          bestDx = dx
          bestDy = dy
        }
      }
    }

    return { dx: bestDx, dy: bestDy, score: bestScore }
  }

  /**
   * Calculate similarity between two blocks (normalized cross-correlation)
   */
  private blockSimilarity(
    frame1: ImageData,
    frame2: ImageData,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    size: number
  ): number {
    const { width: w1 } = frame1
    const { width: w2 } = frame2

    // Check bounds
    if (x2 < 0 || y2 < 0 || x2 + size > w2 || y2 + size > frame2.height) {
      return 0
    }

    let sum1 = 0, sum2 = 0, sum12 = 0, sum1Sq = 0, sum2Sq = 0

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx1 = ((y1 + y) * w1 + (x1 + x)) * 4
        const idx2 = ((y2 + y) * w2 + (x2 + x)) * 4

        const lum1 = 0.299 * frame1.data[idx1] + 0.587 * frame1.data[idx1 + 1] + 0.114 * frame1.data[idx1 + 2]
        const lum2 = 0.299 * frame2.data[idx2] + 0.587 * frame2.data[idx2 + 1] + 0.114 * frame2.data[idx2 + 2]

        sum1 += lum1
        sum2 += lum2
        sum12 += lum1 * lum2
        sum1Sq += lum1 * lum1
        sum2Sq += lum2 * lum2
      }
    }

    const n = size * size
    const numerator = n * sum12 - sum1 * sum2
    const denominator = Math.sqrt((n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2))

    return denominator === 0 ? 0 : numerator / denominator
  }

  /**
   * Aggregate motion vectors to estimate global motion
   */
  private aggregateMotionVectors(
    vectors: Array<{x: number, y: number, dx: number, dy: number}>,
    width: number,
    height: number
  ): GlobalMotionEstimate {
    if (vectors.length === 0) {
      return {
        motionX: 0,
        motionY: 0,
        confidence: 0,
        magnitude: 0,
        timestamp: Date.now()
      }
    }

    // Use RANSAC-like approach to find dominant motion
    const motionClusters = this.clusterMotionVectors(vectors)

    // Select largest cluster as global motion
    let bestCluster = motionClusters[0]
    for (const cluster of motionClusters) {
      if (cluster.vectors.length > bestCluster.vectors.length) {
        bestCluster = cluster
      }
    }

    const avgMotionX = bestCluster.vectors.reduce((sum, v) => sum + v.dx, 0) / bestCluster.vectors.length
    const avgMotionY = bestCluster.vectors.reduce((sum, v) => sum + v.dy, 0) / bestCluster.vectors.length
    const magnitude = Math.sqrt(avgMotionX * avgMotionX + avgMotionY * avgMotionY)

    // Scale back to original resolution
    const scaleFactor = Math.max(width, height) / 160
    const scaledMotionX = avgMotionX * scaleFactor
    const scaledMotionY = avgMotionY * scaleFactor

    return {
      motionX: scaledMotionX,
      motionY: scaledMotionY,
      confidence: bestCluster.vectors.length / vectors.length,
      magnitude: magnitude * scaleFactor,
      timestamp: Date.now()
    }
  }

  /**
   * Cluster motion vectors using simple distance-based clustering
   */
  private clusterMotionVectors(vectors: Array<{x: number, y: number, dx: number, dy: number}>):
    Array<{centerX: number, centerY: number, vectors: typeof vectors}> {

    const clusters: Array<{centerX: number, centerY: number, vectors: typeof vectors}> = []
    const threshold = 2.0 // Motion vector distance threshold

    for (const vector of vectors) {
      let assigned = false

      for (const cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(vector.dx - cluster.centerX, 2) +
          Math.pow(vector.dy - cluster.centerY, 2)
        )

        if (distance < threshold) {
          cluster.vectors.push(vector)
          // Update cluster center
          cluster.centerX = cluster.vectors.reduce((sum, v) => sum + v.dx, 0) / cluster.vectors.length
          cluster.centerY = cluster.vectors.reduce((sum, v) => sum + v.dy, 0) / cluster.vectors.length
          assigned = true
          break
        }
      }

      if (!assigned) {
        clusters.push({
          centerX: vector.dx,
          centerY: vector.dy,
          vectors: [vector]
        })
      }
    }

    return clusters
  }

  /**
   * Reset motion estimator
   */
  reset(): void {
    this.prevFrame = null
  }
}

/**
 * Tracker configuration
 */
export interface TrackerConfig {
  /** Minimum correlation score for successful tracking */
  minCorrelationThreshold: number
  /** Search region size relative to ROI */
  searchRegionSize: number
  /** Maximum expected motion per frame (pixels) */
  maxExpectedMotion: number
  /** Minimum tracking confidence */
  minTrackingConfidence: number
  /** Confidence decay rate per frame */
  confidenceDecayRate: number
  /** Maximum frames to predict without detection */
  maxPredictionFrames: number
  /** Innovation history size */
  innovationHistorySize: number
  /** Innovation window size for averaging */
  innovationWindowSize: number
}

/**
 * Motion estimation configuration
 */
export interface MotionConfig {
  /** Block size for motion estimation */
  blockSize: number
  /** Search range for block matching */
  searchRange: number
}

export const DEFAULT_TRACKER_CONFIG: TrackerConfig = {
  minCorrelationThreshold: 0.7,
  searchRegionSize: 0.5, // 50% of ROI size
  maxExpectedMotion: 20, // pixels
  minTrackingConfidence: 0.3,
  confidenceDecayRate: 0.95,
  maxPredictionFrames: 10,
  innovationHistorySize: 20,
  innovationWindowSize: 5
}

export const DEFAULT_MOTION_CONFIG: MotionConfig = {
  blockSize: 16,
  searchRange: 8
}
