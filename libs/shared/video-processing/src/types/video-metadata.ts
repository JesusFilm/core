/**
 * Video metadata extracted during the probing phase of auto-crop pipeline
 */
export interface VideoMetadata {
  /** Original video dimensions */
  width: number
  height: number
  /** Video duration in seconds */
  duration: number
  /** Frame rate (fps) */
  fps: number
  /** Video rotation/orientation in degrees (0, 90, 180, 270) */
  rotation: number
  /** Whether the video has an audio track */
  hasAudio: boolean
  /** Video codec information */
  codec?: string
  /** Audio codec information (if hasAudio is true) */
  audioCodec?: string
  /** Bitrate information */
  bitrate?: number
  /** Color space information */
  colorSpace?: string
  /** Pixel format */
  pixelFormat?: string
  /** Container format (mp4, mov, etc.) */
  containerFormat?: string
  /** File size in bytes */
  fileSize?: number
  /** Creation timestamp */
  createdAt?: Date
  /** Last modified timestamp */
  updatedAt?: Date
}

/**
 * Target output specifications for auto-crop rendering
 */
export interface OutputTarget {
  /** Output resolution width */
  width: number
  /** Output resolution height */
  height: number
  /** Target aspect ratio (9:16 for portrait) */
  aspectRatio: number
  /** Target frame rate */
  fps: number
  /** Keyframe interval in seconds */
  keyframeInterval: number
  /** Video codec for output */
  videoCodec: string
  /** Audio codec for output */
  audioCodec: string
  /** Target video bitrate in Mbps */
  videoBitrateMbps: number
  /** Target audio bitrate in kbps */
  audioBitrateKbps: number
}

/**
 * Default output target for vertical video (9:16 aspect ratio)
 */
export const DEFAULT_OUTPUT_TARGET: OutputTarget = {
  width: 1080,
  height: 1920,
  aspectRatio: 9 / 16,
  fps: 30,
  keyframeInterval: 2,
  videoCodec: 'h264',
  audioCodec: 'aac',
  videoBitrateMbps: 8,
  audioBitrateKbps: 128
}

/**
 * Alternative high-quality output target
 */
export const HIGH_QUALITY_OUTPUT_TARGET: OutputTarget = {
  ...DEFAULT_OUTPUT_TARGET,
  fps: 60,
  videoBitrateMbps: 12,
  audioBitrateKbps: 192
}
