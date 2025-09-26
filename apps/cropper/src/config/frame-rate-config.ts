/**
 * Global frame rate configuration for all video processing operations
 *
 * Frame rates are carefully chosen based on:
 * - Face Detection: Needs responsive tracking (higher FPS)
 * - Scene Detection: Needs temporal analysis (moderate FPS)
 * - Scene Analysis: Needs content understanding (lower FPS)
 * - Performance: Balance between accuracy and CPU usage
 */

export const FRAME_RATE_CONFIG = {
  // Face/Person detection for auto-tracking
  FACE_DETECTION: {
    fps: 0.5, // Process 1 frame every 2 seconds
    intervalMs: 2000, // 1000 / 0.5
    description: 'Face detection for real-time subject tracking'
  },

  // Scene change detection (edge-based analysis)
  SCENE_DETECTION: {
    fps: 1, // Process 1 frames per second
    intervalMs: 1000, // 1000 / 1
    description: 'Scene change detection using edge analysis'
  },

  // Scene metadata analysis (brightness, colors, etc.)
  SCENE_ANALYSIS: {
    fps: 1, // Process 1 frame per second
    intervalMs: 1000, // 1000 / 1
    description: 'Scene metadata extraction for content analysis'
  }
} as const

export type FrameRateType = keyof typeof FRAME_RATE_CONFIG

export interface FrameRateConfig {
  fps: number
  intervalMs: number
  description: string
}

/**
 * Get frame rate configuration by type
 */
export function getFrameRateConfig(type: FrameRateType): FrameRateConfig {
  return FRAME_RATE_CONFIG[type]
}

/**
 * Get FPS value for a specific process type
 */
export function getFrameRate(type: FrameRateType): number {
  return FRAME_RATE_CONFIG[type].fps
}

/**
 * Get interval in milliseconds for a specific process type
 */
export function getFrameRateInterval(type: FrameRateType): number {
  return FRAME_RATE_CONFIG[type].intervalMs
}

/**
 * Validate frame rate configuration
 */
export function validateFrameRateConfig(): void {
  const configs = Object.values(FRAME_RATE_CONFIG)

  for (const config of configs) {
    if (config.fps <= 0 || config.fps > 60) {
      throw new Error(`Invalid FPS: ${config.fps}. Must be between 1-60`)
    }

    const calculatedInterval = 1000 / config.fps
    if (Math.abs(config.intervalMs - calculatedInterval) > 1) {
      throw new Error(`Inconsistent interval for ${config.fps} FPS: expected ${calculatedInterval}ms, got ${config.intervalMs}ms`)
    }
  }
}

// Auto-validate on module load
validateFrameRateConfig()
