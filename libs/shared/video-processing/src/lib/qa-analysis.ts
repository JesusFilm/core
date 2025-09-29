/**
 * QA analysis functions for auto-crop pipeline validation
 */

import type {
  VirtualCameraPath,
  VirtualCameraKeyframe,
  PathQAMetrics,
  ShotBoundary
} from '../types/virtual-camera'
import type { FaceDetection } from '../types/face-tracking'

/**
 * Configuration for QA analysis
 */
export interface QAAnalysisConfig {
  /** Maximum acceptable pan velocity */
  maxPanVelocityThreshold: number
  /** Maximum acceptable jitter score */
  maxJitterThreshold: number
  /** Minimum required face area ratio */
  minFaceAreaRatio: number
  /** Maximum acceptable forehead/chin cutoffs */
  maxCutoffsThreshold: number
}

/**
 * Default QA analysis configuration
 */
export const DEFAULT_QA_CONFIG: QAAnalysisConfig = {
  maxPanVelocityThreshold: 0.12,
  maxJitterThreshold: 0.05,
  minFaceAreaRatio: 0.3,
  maxCutoffsThreshold: 0
}

/**
 * Run comprehensive QA analysis on a virtual camera path
 */
export function analyzePathQA(
  path: VirtualCameraPath,
  faceDetections: FaceDetection[][],
  shotBoundaries: ShotBoundary[],
  config: QAAnalysisConfig = DEFAULT_QA_CONFIG
): PathQAMetrics {
  const keyframes = path.keyframes

  // Analyze face coverage
  const faceCoverage = analyzeFaceCoverage(keyframes, faceDetections)

  // Analyze motion stability
  const motionStability = analyzeMotionStability(keyframes)

  // Analyze scene transitions
  const sceneTransitions = analyzeSceneTransitions(keyframes, shotBoundaries)

  // Generate critical issues and warnings
  const criticalIssues = generateCriticalIssues(
    faceCoverage,
    motionStability,
    sceneTransitions,
    config
  )

  const warnings = generateWarnings(
    faceCoverage,
    motionStability,
    sceneTransitions,
    config
  )

  // Calculate overall score
  const overallScore = calculateOverallScore(
    faceCoverage,
    motionStability,
    sceneTransitions,
    criticalIssues.length,
    warnings.length
  )

  return {
    faceCoverage,
    motionStability,
    sceneTransitions,
    overallScore,
    criticalIssues,
    warnings
  }
}

/**
 * Analyze face coverage metrics
 */
function analyzeFaceCoverage(
  keyframes: VirtualCameraKeyframe[],
  faceDetections: FaceDetection[][]
): PathQAMetrics['faceCoverage'] {
  let totalFrames = 0
  let fullFaceVisibleFrames = 0
  let totalFaceAreaRatio = 0
  let foreheadCutoffs = 0
  let chinCutoffs = 0

  keyframes.forEach((keyframe, index) => {
    totalFrames++

    const detections = faceDetections[index] || []

    if (detections.length > 0) {
      // Find the primary face (largest area)
      const primaryFace = detections.reduce((max, face) =>
        (face.boundingBox[2] * face.boundingBox[3]) > (max.boundingBox[2] * max.boundingBox[3]) ? face : max
      )

      const [x, y, width, height] = primaryFace.boundingBox

      // Calculate face area ratio relative to crop window
      const faceArea = width * height
      const cropArea = keyframe.cw * keyframe.ch
      const faceAreaRatio = faceArea / cropArea
      totalFaceAreaRatio += faceAreaRatio

      // Check for forehead/chin cutoffs (face extending beyond crop boundaries)
      const faceCenterY = y + height / 2
      const cropTop = keyframe.cy
      const cropBottom = keyframe.cy + keyframe.ch

      // Forehead cutoff (face extends above crop top)
      if (faceCenterY - height / 2 < cropTop) {
        foreheadCutoffs++
      }

      // Chin cutoff (face extends below crop bottom)
      if (faceCenterY + height / 2 > cropBottom) {
        chinCutoffs++
      }

      // Full face visible (entire face within crop bounds)
      const faceTop = y
      const faceBottom = y + height
      const faceLeft = x
      const faceRight = x + width

      const cropLeft = keyframe.cx
      const cropRight = keyframe.cx + keyframe.cw

      if (faceTop >= cropTop && faceBottom <= cropBottom &&
          faceLeft >= cropLeft && faceRight <= cropRight) {
        fullFaceVisibleFrames++
      }
    }
  })

  return {
    fullFaceVisible: totalFrames > 0 ? fullFaceVisibleFrames / totalFrames : 0,
    avgFaceAreaRatio: totalFrames > 0 ? totalFaceAreaRatio / totalFrames : 0,
    foreheadCutoffs,
    chinCutoffs
  }
}

/**
 * Analyze motion stability metrics
 */
function analyzeMotionStability(keyframes: VirtualCameraKeyframe[]): PathQAMetrics['motionStability'] {
  if (keyframes.length < 2) {
    return {
      avgPanVelocity: 0,
      maxPanVelocity: 0,
      jitterScore: 0,
      excessiveVelocityFrames: 0
    }
  }

  let totalVelocity = 0
  let maxVelocity = 0
  let excessiveVelocityFrames = 0
  const velocities: number[] = []

  for (let i = 1; i < keyframes.length; i++) {
    const prev = keyframes[i - 1]
    const curr = keyframes[i]

    // Calculate pan velocity (change in center position)
    const deltaX = Math.abs(curr.cx - prev.cx)
    const deltaY = Math.abs(curr.cy - prev.cy)
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    velocities.push(velocity)
    totalVelocity += velocity
    maxVelocity = Math.max(maxVelocity, velocity)

    if (velocity > 0.12) { // Max pan velocity threshold
      excessiveVelocityFrames++
    }
  }

  // Calculate jitter score (standard deviation of velocities)
  const avgVelocity = velocities.length > 0 ? totalVelocity / velocities.length : 0
  const variance = velocities.reduce((sum, v) => sum + Math.pow(v - avgVelocity, 2), 0) / velocities.length
  const jitterScore = Math.sqrt(variance)

  return {
    avgPanVelocity: avgVelocity,
    maxPanVelocity,
    jitterScore,
    excessiveVelocityFrames
  }
}

/**
 * Analyze scene transition metrics
 */
function analyzeSceneTransitions(
  keyframes: VirtualCameraKeyframe[],
  shotBoundaries: ShotBoundary[]
): PathQAMetrics['sceneTransitions'] {
  let pansAcrossCuts = 0
  let hardCuts = 0
  let unEasedFaceSwaps = 0

  shotBoundaries.forEach(shot => {
    // Find keyframes around the shot boundary
    const beforeCut = keyframes
      .filter(k => k.t < shot.startFrame)
      .slice(-3) // Last 3 frames before cut

    const afterCut = keyframes
      .filter(k => k.t > shot.endFrame)
      .slice(0, 3) // First 3 frames after cut

    if (beforeCut.length > 0 && afterCut.length > 0) {
      const lastBefore = beforeCut[beforeCut.length - 1]
      const firstAfter = afterCut[0]

      // Check for pan across cut (significant position change)
      const deltaX = Math.abs(firstAfter.cx - lastBefore.cx)
      const deltaY = Math.abs(firstAfter.cy - lastBefore.cy)
      const positionChange = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (positionChange > 0.05) { // Significant position change threshold
        pansAcrossCuts++
      } else {
        hardCuts++
      }
    }
  })

  // Note: Face swap analysis would require face tracking data across shots
  // For now, this is a placeholder
  unEasedFaceSwaps = 0

  return {
    pansAcrossCuts,
    hardCuts,
    unEasedFaceSwaps
  }
}

/**
 * Generate critical issues list
 */
function generateCriticalIssues(
  faceCoverage: PathQAMetrics['faceCoverage'],
  motionStability: PathQAMetrics['motionStability'],
  sceneTransitions: PathQAMetrics['sceneTransitions'],
  config: QAAnalysisConfig
): string[] {
  const issues: string[] = []

  // Face coverage issues
  if (faceCoverage.fullFaceVisible < 0.8) {
    issues.push(`Only ${(faceCoverage.fullFaceVisible * 100).toFixed(1)}% of frames show full face`)
  }

  if (faceCoverage.foreheadCutoffs > 0) {
    issues.push(`${faceCoverage.foreheadCutoffs} frames have forehead cut off`)
  }

  if (faceCoverage.chinCutoffs > 0) {
    issues.push(`${faceCoverage.chinCutoffs} frames have chin cut off`)
  }

  if (faceCoverage.avgFaceAreaRatio < config.minFaceAreaRatio) {
    issues.push(`Average face area ratio ${(faceCoverage.avgFaceAreaRatio * 100).toFixed(1)}% is below minimum ${config.minFaceAreaRatio * 100}%`)
  }

  // Motion stability issues
  if (motionStability.maxPanVelocity > config.maxPanVelocityThreshold) {
    issues.push(`Maximum pan velocity ${motionStability.maxPanVelocity.toFixed(3)} exceeds threshold ${config.maxPanVelocityThreshold}`)
  }

  if (motionStability.jitterScore > config.maxJitterThreshold) {
    issues.push(`Jitter score ${motionStability.jitterScore.toFixed(3)} exceeds threshold ${config.maxJitterThreshold}`)
  }

  // Scene transition issues
  if (sceneTransitions.pansAcrossCuts > 0) {
    issues.push(`${sceneTransitions.pansAcrossCuts} scene cuts have camera pans across boundaries`)
  }

  return issues
}

/**
 * Generate warnings list
 */
function generateWarnings(
  faceCoverage: PathQAMetrics['faceCoverage'],
  motionStability: PathQAMetrics['motionStability'],
  sceneTransitions: PathQAMetrics['sceneTransitions'],
  config: QAAnalysisConfig
): string[] {
  const warnings: string[] = []

  // Face coverage warnings
  if (faceCoverage.fullFaceVisible < 0.9) {
    warnings.push(`Face visibility ${(faceCoverage.fullFaceVisible * 100).toFixed(1)}% could be improved`)
  }

  // Motion stability warnings
  if (motionStability.excessiveVelocityFrames > 0) {
    warnings.push(`${motionStability.excessiveVelocityFrames} frames exceed velocity limits`)
  }

  if (motionStability.jitterScore > config.maxJitterThreshold * 0.5) {
    warnings.push(`Moderate jitter detected (score: ${motionStability.jitterScore.toFixed(3)})`)
  }

  // Scene transition warnings
  if (sceneTransitions.hardCuts > 0) {
    warnings.push(`${sceneTransitions.hardCuts} hard cuts detected - consider adding transitions`)
  }

  return warnings
}

/**
 * Calculate overall QA score
 */
function calculateOverallScore(
  faceCoverage: PathQAMetrics['faceCoverage'],
  motionStability: PathQAMetrics['motionStability'],
  sceneTransitions: PathQAMetrics['sceneTransitions'],
  criticalIssuesCount: number,
  warningsCount: number
): number {
  let score = 100

  // Face coverage penalties
  score -= (1 - faceCoverage.fullFaceVisible) * 30 // Max 30 points for face visibility
  score -= Math.min(faceCoverage.foreheadCutoffs + faceCoverage.chinCutoffs, 10) * 5 // Max 50 points for cutoffs
  score -= Math.max(0, 0.4 - faceCoverage.avgFaceAreaRatio) * 20 // Penalty for small faces

  // Motion stability penalties
  score -= Math.min(motionStability.maxPanVelocity / 0.12, 2) * 10 // Max 20 points for velocity
  score -= Math.min(motionStability.jitterScore / 0.05, 2) * 10 // Max 20 points for jitter

  // Scene transition penalties
  score -= sceneTransitions.pansAcrossCuts * 10 // 10 points per pan across cut
  score -= sceneTransitions.hardCuts * 2 // 2 points per hard cut

  // Issue penalties
  score -= criticalIssuesCount * 10 // 10 points per critical issue
  score -= warningsCount * 2 // 2 points per warning

  return Math.max(0, Math.min(100, score))
}
