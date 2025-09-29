/**
 * Virtual camera path generation for auto-crop pipeline
 * Implements frame target computation, stabilization, and smoothing
 */

import type {
  VirtualCameraKeyframe,
  VirtualCameraPath,
  VirtualCameraParameters,
  VirtualCameraStats,
  CameraTransition,
  CameraTransitionType
} from '../types/virtual-camera'
import type { FaceTrackingResults, FaceDetection } from '../types/face-tracking'
import type { ShotBoundary } from '../types/scene-detection'
import type { VideoMetadata } from '../types/video-metadata'
import type { CropPath, CropPathEntry } from '../types/crop-path'

/**
 * Input to path generation
 */
export interface PathGenerationInput {
  metadata: VideoMetadata
  faceTracking: FaceTrackingResults
  shots: ShotBoundary[]
  parameters: VirtualCameraParameters
}

/**
 * Generate virtual camera path from face tracking results
 */
export function generateVirtualCameraPath(
  input: PathGenerationInput,
  onProgress?: (progress: { frame: number; totalFrames: number }) => void
): VirtualCameraPath {
  const { metadata, faceTracking, shots, parameters } = input
  const startTime = performance.now()

  // Calculate total frames
  const totalFrames = Math.floor(metadata.duration * metadata.fps)
  const frameDuration = 1 / metadata.fps

  // Initialize path generation state
  const pathGenerator = new VirtualCameraPathGenerator(parameters, metadata)
  const keyframes: VirtualCameraKeyframe[] = []

  // Group shots for processing
  const shotGroups = groupShotsByBoundaries(shots, totalFrames)

  // Process each frame
  for (let frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
    const timestamp = frameIdx * frameDuration
    onProgress?.({ frame: frameIdx, totalFrames })

    // Get primary face for this frame
    const primaryFace = getPrimaryFaceAtTimestamp(faceTracking, timestamp)

    // Find current shot and primary track
    const currentShot = shots.find(shot => frameIdx >= shot.startFrame && frameIdx <= shot.endFrame)
    const currentShotId = currentShot ? `shot_${shots.indexOf(currentShot)}` : 'unknown'
    const primaryTrackEntry = faceTracking.primaryFaceTimeline.find(
      entry => Math.abs(entry.timestamp - timestamp) < 0.1
    )
    const primaryTrackId = primaryTrackEntry?.primaryTrackId || null

    // Generate target for this frame
    const target = pathGenerator.computeFrameTarget(
      primaryFace,
      timestamp,
      frameIdx,
      currentShotId,
      primaryTrackId
    )

    // Apply stabilization and smoothing
    const stabilizedTarget = pathGenerator.applyStabilization(target, timestamp)

    // Create keyframe
    const keyframe: VirtualCameraKeyframe = {
      t: timestamp,
      cx: stabilizedTarget.cx,
      cy: stabilizedTarget.cy,
      cw: stabilizedTarget.cw,
      ch: stabilizedTarget.ch,
      zoom: stabilizedTarget.zoom,
      metadata: {
        faceConfidence: primaryFace?.confidence || 0,
        faceAreaRatio: primaryFace ? calculateFaceAreaRatio(primaryFace, stabilizedTarget) : 0,
        interpolated: false,
        stage: 'stabilization'
      }
    }

    keyframes.push(keyframe)
  }

  // Calculate statistics
  const stats: VirtualCameraStats = {
    totalProcessingTime: performance.now() - startTime,
    framesProcessed: totalFrames,
    avgProcessingTimePerFrame: (performance.now() - startTime) / totalFrames,
    faceDetections: faceTracking.stats.totalDetections,
    sceneChanges: shots.length,
    smoothness: calculatePathSmoothness(keyframes)
  }

  // Create path object
  const path: VirtualCameraPath = {
    id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    videoId: 'auto-generated', // Will be set by caller
    keyframes,
    metadata: {
      duration: metadata.duration,
      sourceDimensions: { width: metadata.width, height: metadata.height },
      targetDimensions: {
        width: Math.round(parameters.faceHeightTarget * 9 / 16 * metadata.height), // 9:16 aspect ratio
        height: Math.round(parameters.faceHeightTarget * metadata.height)
      },
      createdAt: new Date(),
      parameters,
      stats
    }
  }

  return path
}

/**
 * Virtual camera path generator with stabilization and smoothing
 */
class VirtualCameraPathGenerator {
  private lastTarget: FrameTarget | null = null
  private centerFilter: OneEuroFilter
  private zoomFilter: OneEuroFilter
  private lookAheadBuffer: FrameTarget[] = []
  private currentShotId: string | null = null
  private lastPrimaryTrackId: string | null = null
  private transitionState: TransitionState | null = null

  constructor(
    private parameters: VirtualCameraParameters,
    private metadata: VideoMetadata
  ) {
    // Initialize 1-Euro filters for smoothing
    this.centerFilter = new OneEuroFilter({
      beta: parameters.smoothing.centerBeta,
      minCutoff: 1.0,
      dCutoff: 1.0
    })

    this.zoomFilter = new OneEuroFilter({
      beta: parameters.smoothing.zoomBeta,
      minCutoff: 1.0,
      dCutoff: 1.0
    })
  }

  /**
   * Compute target crop window for a frame
   */
  computeFrameTarget(
    primaryFace: FaceDetection | null,
    timestamp: number,
    frameIdx: number,
    currentShotId?: string,
    primaryTrackId?: string | null
  ): FrameTarget {
    // Check for scene changes (hard cuts)
    if (currentShotId && currentShotId !== this.currentShotId) {
      this.handleSceneChange(frameIdx)
      this.currentShotId = currentShotId
    }

    // Check for face changes
    if (primaryTrackId !== this.lastPrimaryTrackId) {
      this.handleFaceChange(primaryTrackId || null, frameIdx)
      this.lastPrimaryTrackId = primaryTrackId || null
    }

    // Check if we're in a transition
    if (this.transitionState && frameIdx <= this.transitionState.endFrame) {
      return this.applyTransition(frameIdx)
    }

    // Clear transition if completed
    if (this.transitionState && frameIdx > this.transitionState.endFrame) {
      this.transitionState = null
    }

    if (!primaryFace) {
      // No face detected - check if we should start face-lost transition
      if (this.lastTarget?.hasFace) {
        this.handleFaceLost(frameIdx)
        if (this.transitionState) {
          return this.applyTransition(frameIdx)
        }
      }
      // No face detected - fallback to center with widening
      return this.computeFallbackTarget(timestamp)
    }

    // Calculate desired crop dimensions for 9:16 aspect ratio
    const targetAspect = 9 / 16
    const faceHeight = primaryFace.box.height
    const faceWidth = primaryFace.box.width

    // Dynamic zoom: aim for face height to be ~35% of crop height
    const targetFaceHeightRatio = this.parameters.faceHeightTarget
    const targetCropHeight = faceHeight / targetFaceHeightRatio
    const targetCropWidth = targetCropHeight * targetAspect

    // Clamp zoom bounds
    const minCropHeight = this.metadata.height * 0.5 // Fill at least half height
    const maxCropHeight = this.metadata.height * this.parameters.maxUpscale
    const clampedCropHeight = Math.max(minCropHeight, Math.min(maxCropHeight, targetCropHeight))
    const clampedCropWidth = clampedCropHeight * targetAspect

    // Calculate center position from face center
    let centerX = primaryFace.box.x + faceWidth / 2
    let centerY = primaryFace.box.y + faceHeight / 2

    // Apply vertical center bias for UI safe area (+3-4% upward)
    centerY -= clampedCropHeight * this.parameters.verticalCenterBias

    // Normalize coordinates to 0-1
    const normalizedCenterX = centerX / this.metadata.width
    const normalizedCenterY = centerY / this.metadata.height

    return {
      cx: normalizedCenterX,
      cy: normalizedCenterY,
      cw: clampedCropWidth / this.metadata.width,
      ch: clampedCropHeight / this.metadata.height,
      zoom: clampedCropHeight / this.metadata.height,
      timestamp,
      frameIdx,
      hasFace: true,
      velocityX: 0,
      velocityY: 0
    }
  }

  /**
   * Apply stabilization and smoothing to target
   */
  applyStabilization(target: FrameTarget, timestamp: number): FrameTarget {
    // Apply dead-zone to suppress micro-jitter
    const deadZonedTarget = this.applyDeadZone(target)

    // Apply 1-Euro filtering for smooth motion
    const smoothedCenterX = this.centerFilter.filter(deadZonedTarget.cx, timestamp)
    const smoothedCenterY = this.centerFilter.filter(deadZonedTarget.cy, timestamp)
    const smoothedZoom = this.zoomFilter.filter(deadZonedTarget.zoom || 1.0, timestamp)

    let stabilizedTarget = {
      ...deadZonedTarget,
      cx: smoothedCenterX,
      cy: smoothedCenterY,
      zoom: smoothedZoom
    }

    // Apply velocity and acceleration limits
    stabilizedTarget = this.applyMotionLimits(stabilizedTarget)

    // Clamp to video bounds
    stabilizedTarget = this.clampToBounds(stabilizedTarget)

    // Update look-ahead buffer if enabled
    if (this.parameters.lookAheadFrames > 0) {
      this.lookAheadBuffer.push(stabilizedTarget)
      if (this.lookAheadBuffer.length > this.parameters.lookAheadFrames) {
        this.lookAheadBuffer.shift()
      }

      // Apply look-ahead smoothing if we have enough buffer
      if (this.lookAheadBuffer.length >= Math.min(6, this.parameters.lookAheadFrames)) {
        stabilizedTarget = this.applyLookAheadSmoothing(stabilizedTarget)
      }
    }

    this.lastTarget = stabilizedTarget
    return stabilizedTarget
  }

  /**
   * Apply dead-zone to prevent micro-jitter
   */
  private applyDeadZone(target: FrameTarget): FrameTarget {
    if (!this.lastTarget) return target

    const deadZoneWidth = this.parameters.deadZoneWidth
    const deadZoneHeight = this.parameters.deadZoneHeight

    // Check if target is within dead-zone of last position
    const deltaX = Math.abs(target.cx - this.lastTarget.cx)
    const deltaY = Math.abs(target.cy - this.lastTarget.cy)

    if (deltaX < deadZoneWidth && deltaY < deadZoneHeight) {
      // Within dead-zone - keep last position
      return {
        ...target,
        cx: this.lastTarget.cx,
        cy: this.lastTarget.cy
      }
    }

    return target
  }

  /**
   * Apply velocity and acceleration limits
   */
  private applyMotionLimits(target: FrameTarget): FrameTarget {
    if (!this.lastTarget) return target

    const dt = target.timestamp - this.lastTarget.timestamp
    if (dt <= 0) return target

    const maxVelocity = this.parameters.stabilization.maxPanVelocity
    const maxAccel = this.parameters.stabilization.maxAcceleration

    // Calculate required velocity
    const velX = (target.cx - this.lastTarget.cx) / dt
    const velY = (target.cy - this.lastTarget.cy) / dt

    // Limit velocity
    const limitedVelX = Math.max(-maxVelocity, Math.min(maxVelocity, velX))
    const limitedVelY = Math.max(-maxVelocity, Math.min(maxVelocity, velY))

    // Calculate acceleration
    const accelX = (limitedVelX - (this.lastTarget.velocityX || 0)) / dt
    const accelY = (limitedVelY - (this.lastTarget.velocityY || 0)) / dt

    // Limit acceleration
    const clampedAccelX = Math.max(-maxAccel, Math.min(maxAccel, accelX))
    const clampedAccelY = Math.max(-maxAccel, Math.min(maxAccel, accelY))

    // Apply acceleration limits to velocity
    const finalVelX = (this.lastTarget.velocityX || 0) + clampedAccelX * dt
    const finalVelY = (this.lastTarget.velocityY || 0) + clampedAccelY * dt

    // Calculate new position
    const newX = this.lastTarget.cx + finalVelX * dt
    const newY = this.lastTarget.cy + finalVelY * dt

    return {
      ...target,
      cx: newX,
      cy: newY,
      velocityX: finalVelX,
      velocityY: finalVelY
    }
  }

  /**
   * Apply look-ahead smoothing
   */
  private applyLookAheadSmoothing(current: FrameTarget): FrameTarget {
    if (this.lookAheadBuffer.length < 2) return current

    // Simple average of recent frames for stability
    const recentFrames = this.lookAheadBuffer.slice(-3)
    const avgX = recentFrames.reduce((sum, f) => sum + f.cx, 0) / recentFrames.length
    const avgY = recentFrames.reduce((sum, f) => sum + f.cy, 0) / recentFrames.length

    return {
      ...current,
      cx: avgX,
      cy: avgY
    }
  }

  /**
   * Clamp target to video bounds
   */
  private clampToBounds(target: FrameTarget): FrameTarget {
    const halfWidth = target.cw / 2
    const halfHeight = target.ch / 2

    return {
      ...target,
      cx: Math.max(halfWidth, Math.min(1 - halfWidth, target.cx)),
      cy: Math.max(halfHeight, Math.min(1 - halfHeight, target.cy))
    }
  }

  /**
   * Handle scene change (hard cut)
   */
  private handleSceneChange(frameIdx: number): void {
    if (this.lastTarget) {
      // Hard cut - no easing, immediate jump to new position
      this.transitionState = {
        type: 'hard_cut',
        startFrame: frameIdx,
        endFrame: frameIdx, // Immediate transition
        startTarget: this.lastTarget,
        endTarget: this.lastTarget, // Will be overridden by next target
        progress: 1.0
      }
      // Reset filters to prevent smoothing across cuts
      this.centerFilter.reset()
      this.zoomFilter.reset()
    }
  }

  /**
   * Handle primary face change
   */
  private handleFaceChange(newTrackId: string | null, frameIdx: number): void {
    if (!this.lastTarget || !newTrackId) return

    // Quick ease over 6-12 frames if same shot, unless faces are far apart
    const transitionFrames = 8 // ~0.3s at 30fps
    this.transitionState = {
      type: 'face_swap',
      startFrame: frameIdx,
      endFrame: frameIdx + transitionFrames,
      startTarget: this.lastTarget,
      endTarget: this.lastTarget, // Will be overridden by next target
      progress: 0.0
    }
  }

  /**
   * Handle face lost transition
   */
  private handleFaceLost(frameIdx: number): void {
    if (!this.lastTarget) return

    // Hold last position for M frames (2 seconds), then slowly widen
    const holdFrames = Math.floor(2.0 * this.metadata.fps)
    this.transitionState = {
      type: 'face_lost',
      startFrame: frameIdx,
      endFrame: frameIdx + holdFrames,
      startTarget: this.lastTarget,
      endTarget: {
        ...this.lastTarget,
        cw: this.lastTarget.cw * 1.2, // Widen framing
        ch: this.lastTarget.ch * 1.2,
        zoom: (this.lastTarget.zoom || 1.0) * 1.2,
        hasFace: false
      },
      progress: 0.0
    }
  }

  /**
   * Apply transition interpolation
   */
  private applyTransition(frameIdx: number): FrameTarget {
    if (!this.transitionState) return this.lastTarget!

    const { startFrame, endFrame, startTarget, endTarget } = this.transitionState
    let progress = (frameIdx - startFrame) / Math.max(1, endFrame - startFrame)
    progress = Math.min(1.0, Math.max(0.0, progress))

    this.transitionState.progress = progress

    // Different easing for different transition types
    let easedProgress = progress
    switch (this.transitionState.type) {
      case 'hard_cut':
        easedProgress = 1.0 // Immediate
        break
      case 'face_swap':
        easedProgress = this.easeInOutQuad(progress) // Smooth ease
        break
      case 'face_lost':
        easedProgress = progress < 0.7 ? 0.0 : this.easeOutQuad((progress - 0.7) / 0.3) // Hold then ease
        break
    }

    return {
      cx: startTarget.cx + (endTarget.cx - startTarget.cx) * easedProgress,
      cy: startTarget.cy + (endTarget.cy - startTarget.cy) * easedProgress,
      cw: startTarget.cw + (endTarget.cw - startTarget.cw) * easedProgress,
      ch: startTarget.ch + (endTarget.ch - startTarget.ch) * easedProgress,
      zoom: (startTarget.zoom || 1.0) + ((endTarget.zoom || 1.0) - (startTarget.zoom || 1.0)) * easedProgress,
      timestamp: startTarget.timestamp + (endTarget.timestamp - startTarget.timestamp) * progress,
      frameIdx,
      hasFace: endTarget.hasFace,
      velocityX: 0, // No velocity during transitions
      velocityY: 0
    }
  }

  /**
   * Easing functions
   */
  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  }

  private easeOutQuad(t: number): number {
    return 1 - (1 - t) * (1 - t)
  }

  /**
   * Compute fallback target when no face is detected
   */
  private computeFallbackTarget(timestamp: number): FrameTarget {
    // Start with center position
    let cx = 0.5
    let cy = 0.5

    // If we have a last target, gradually widen framing
    if (this.lastTarget && this.lastTarget.hasFace) {
      // Increase zoom slightly to widen framing
      const widenFactor = 1.1
      const newZoom = Math.min(1.0, (this.lastTarget.zoom || 1.0) * widenFactor)

      return {
        cx: this.lastTarget.cx,
        cy: this.lastTarget.cy,
        cw: this.lastTarget.cw * widenFactor,
        ch: this.lastTarget.ch * widenFactor,
        zoom: newZoom,
        timestamp,
        frameIdx: Math.floor(timestamp * this.metadata.fps),
        hasFace: false,
        velocityX: 0,
        velocityY: 0
      }
    }

    // Default fallback - center with reasonable zoom
    return {
      cx: 0.5,
      cy: 0.5,
      cw: 0.8, // 80% of width
      ch: 0.8, // 80% of height
      zoom: 0.8,
      timestamp,
      frameIdx: Math.floor(timestamp * this.metadata.fps),
      hasFace: false,
      velocityX: 0,
      velocityY: 0
    }
  }
}

/**
 * Internal frame target representation
 */
interface FrameTarget {
  cx: number // Normalized center X (0-1)
  cy: number // Normalized center Y (0-1)
  cw: number // Normalized crop width (0-1)
  ch: number // Normalized crop height (0-1)
  zoom: number // Zoom factor
  timestamp: number
  frameIdx: number
  hasFace: boolean
  velocityX?: number // For motion limiting
  velocityY?: number // For motion limiting
}

/**
 * Transition state for handling scene changes and face switches
 */
interface TransitionState {
  type: 'hard_cut' | 'face_swap' | 'face_lost'
  startFrame: number
  endFrame: number
  startTarget: FrameTarget
  endTarget: FrameTarget
  progress: number // 0-1
}

/**
 * Get primary face at a specific timestamp
 */
function getPrimaryFaceAtTimestamp(
  faceTracking: FaceTrackingResults,
  timestamp: number
): FaceDetection | null {
  // Find the primary face timeline entry for this timestamp
  const timelineEntry = faceTracking.primaryFaceTimeline.find(
    entry => Math.abs(entry.timestamp - timestamp) < 0.1 // Within 100ms
  )

  if (!timelineEntry || !timelineEntry.primaryTrackId) {
    return null
  }

  // Find the track
  const track = faceTracking.tracks.find(t => t.trackId === timelineEntry.primaryTrackId)
  if (!track) return null

  // Find the detection closest to this timestamp
  const closestDetection = track.detections.reduce((closest, detection) => {
    const currentDiff = Math.abs(detection.timestamp - timestamp)
    const closestDiff = Math.abs(closest.timestamp - timestamp)
    return currentDiff < closestDiff ? detection : closest
  })

  return closestDetection
}

/**
 * Calculate face area ratio relative to crop area
 */
function calculateFaceAreaRatio(face: FaceDetection, target: FrameTarget): number {
  const faceArea = face.box.width * face.box.height
  const cropArea = target.cw * target.ch
  return cropArea > 0 ? faceArea / cropArea : 0
}

/**
 * Group shots by their boundaries for processing
 * Returns the shots as-is since they already contain full boundary information
 */
function groupShotsByBoundaries(shots: ShotBoundary[], totalFrames: number): ShotBoundary[][] {
  if (shots.length === 0) {
    // Create a default shot covering the entire video
    const defaultShot: ShotBoundary = {
      startFrame: 0,
      endFrame: totalFrames - 1,
      startTime: 0,
      endTime: totalFrames / 30, // Assume 30fps for default
      duration: totalFrames / 30,
      confidence: 1.0,
      method: 'final',
      metadata: {}
    }
    return [[defaultShot]]
  }

  // For now, just return shots as individual groups
  // In the future, we might want to group related shots
  return shots.map(shot => [shot])
}

/**
 * Calculate path smoothness metrics
 */
function calculatePathSmoothness(keyframes: VirtualCameraKeyframe[]): VirtualCameraStats['smoothness'] {
  if (keyframes.length < 2) {
    return { avgVelocity: 0, maxVelocity: 0, jitterScore: 0 }
  }

  let totalVelocity = 0
  let maxVelocity = 0
  let totalJitter = 0

  for (let i = 1; i < keyframes.length; i++) {
    const prev = keyframes[i - 1]
    const curr = keyframes[i]
    const dt = curr.t - prev.t

    if (dt > 0) {
      const velocity = Math.sqrt(
        Math.pow((curr.cx - prev.cx) / dt, 2) +
        Math.pow((curr.cy - prev.cy) / dt, 2)
      )

      totalVelocity += velocity
      maxVelocity = Math.max(maxVelocity, velocity)

      // Calculate jitter as acceleration changes
      if (i > 1) {
        const prevPrev = keyframes[i - 2]
        const prevVelocity = Math.sqrt(
          Math.pow((prev.cx - prevPrev.cx) / dt, 2) +
          Math.pow((prev.cy - prevPrev.cy) / dt, 2)
        )
        const acceleration = Math.abs(velocity - prevVelocity) / dt
        totalJitter += acceleration
      }
    }
  }

  return {
    avgVelocity: totalVelocity / (keyframes.length - 1),
    maxVelocity,
    jitterScore: totalJitter / (keyframes.length - 2)
  }
}

/**
 * Path serialization utilities for export/import with versioning
 */
export class PathSerializer {
  /**
   * Convert VirtualCameraPath to CropPath for serialization
   */
  static serializeVirtualCameraPath(
    virtualPath: VirtualCameraPath,
    videoId: string = 'unknown'
  ): CropPath {
    const entries: CropPathEntry[] = virtualPath.keyframes.map(keyframe => ({
      t: keyframe.t,
      cx: keyframe.cx,
      cy: keyframe.cy,
      cw: keyframe.cw,
      ch: keyframe.ch,
      z: keyframe.zoom
    }))

    const quality = virtualPath.metadata.stats?.smoothness ? {
      smoothness: 1 - Math.min(1, virtualPath.metadata.stats.smoothness.jitterScore / 10), // Normalize jitter to 0-1 scale
      coverage: 0.8, // Placeholder - would need actual coverage calculation
      stability: 1 - Math.min(1, virtualPath.metadata.stats.smoothness.maxVelocity / 0.5) // Normalize velocity
    } : undefined

    return {
      id: virtualPath.id,
      videoId: videoId,
      version: '1.0.0',
      entries,
      metadata: {
        sourceWidth: virtualPath.metadata.sourceDimensions.width,
        sourceHeight: virtualPath.metadata.sourceDimensions.height,
        targetWidth: virtualPath.metadata.targetDimensions.width,
        targetHeight: virtualPath.metadata.targetDimensions.height,
        duration: virtualPath.metadata.duration,
        createdAt: virtualPath.metadata.createdAt,
        modifiedAt: new Date(),
        parameters: virtualPath.metadata.parameters,
        quality
      }
    }
  }

  /**
   * Convert CropPath back to VirtualCameraPath for use in rendering
   */
  static deserializeCropPath(cropPath: CropPath): VirtualCameraPath {
    const keyframes: VirtualCameraKeyframe[] = cropPath.entries.map(entry => ({
      t: entry.t,
      cx: entry.cx,
      cy: entry.cy,
      cw: entry.cw,
      ch: entry.ch,
      zoom: entry.z,
      metadata: {
        interpolated: false,
        stage: 'stabilization' // Use valid stage value
      }
    }))

    // Calculate basic stats from keyframes
    const smoothness = calculatePathSmoothness(keyframes)

    return {
      id: cropPath.id,
      videoId: cropPath.videoId,
      keyframes,
      metadata: {
        duration: cropPath.metadata.duration,
        sourceDimensions: {
          width: cropPath.metadata.sourceWidth,
          height: cropPath.metadata.sourceHeight
        },
        targetDimensions: {
          width: cropPath.metadata.targetWidth,
          height: cropPath.metadata.targetHeight
        },
        createdAt: cropPath.metadata.createdAt,
        parameters: cropPath.metadata.parameters as VirtualCameraParameters,
        stats: {
          totalProcessingTime: 0, // Not available for imported paths
          framesProcessed: keyframes.length,
          avgProcessingTimePerFrame: 0,
          faceDetections: 0,
          sceneChanges: 0,
          smoothness
        }
      }
    }
  }

  /**
   * Export path as JSON string with metadata
   */
  static exportToJSON(cropPath: CropPath): string {
    return JSON.stringify({
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      cropPath
    }, null, 2)
  }

  /**
   * Import path from JSON string with validation
   */
  static importFromJSON(jsonString: string): CropPath {
    try {
      const parsed = JSON.parse(jsonString)

      // Version compatibility check
      if (!parsed.version || parsed.version !== '1.0.0') {
        throw new Error(`Unsupported path version: ${parsed.version}`)
      }

      if (!parsed.cropPath) {
        throw new Error('Invalid path format: missing cropPath')
      }

      // Validate required fields
      const cropPath = parsed.cropPath
      if (!cropPath.id || !cropPath.entries || !cropPath.metadata) {
        throw new Error('Invalid path format: missing required fields')
      }

      // Update modification time
      cropPath.metadata.modifiedAt = new Date()

      return cropPath
    } catch (error) {
      throw new Error(`Failed to import path: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create a new version of the path with manual overrides
   */
  static createOverrideVersion(
    originalPath: CropPath,
    overrides: Partial<CropPathEntry>[],
    overrideReason?: string
  ): CropPath {
    // Create new path with updated version
    const versionParts = originalPath.version.split('.')
    const newVersion = `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2]) + 1}`

    // Apply overrides to entries
    const updatedEntries = originalPath.entries.map((entry, index) => {
      const override = overrides[index]
      if (!override) return entry

      return {
        ...entry,
        ...override,
        // Mark as manually overridden
        metadata: {
          ...entry,
          manuallyOverridden: true,
          overrideReason
        }
      }
    })

    return {
      ...originalPath,
      id: `${originalPath.id}_override_${Date.now()}`,
      version: newVersion,
      entries: updatedEntries,
      metadata: {
        ...originalPath.metadata,
        modifiedAt: new Date(),
        parameters: {
          ...originalPath.metadata.parameters,
          overrideReason
        }
      }
    }
  }
}

/**
 * Simple 1-Euro filter implementation for smoothing
 */
class OneEuroFilter {
  private xPrev = 0
  private dxPrev = 0
  private tPrev = 0

  constructor(
    private params: {
      beta: number
      minCutoff: number
      dCutoff: number
    }
  ) {}

  filter(x: number, t: number): number {
    if (this.tPrev === 0) {
      this.xPrev = x
      this.tPrev = t
      return x
    }

    const dt = t - this.tPrev

    // Compute derivative
    const dx = (x - this.xPrev) / dt

    // Compute cutoff frequencies
    const cutoff = this.params.minCutoff + this.params.beta * Math.abs(dx)

    // Filter derivative
    const dCutoff = Math.max(this.params.dCutoff, cutoff)
    const alphaD = 1 / (1 + 2 * Math.PI * dCutoff * dt)
    const dxFiltered = alphaD * dx + (1 - alphaD) * this.dxPrev

    // Filter value
    const alpha = 1 / (1 + 2 * Math.PI * cutoff * dt)
    const xFiltered = alpha * x + (1 - alpha) * this.xPrev

    // Update state
    this.xPrev = xFiltered
    this.dxPrev = dxFiltered
    this.tPrev = t

    return xFiltered
  }

  reset(): void {
    this.xPrev = 0
    this.dxPrev = 0
    this.tPrev = 0
  }
}
