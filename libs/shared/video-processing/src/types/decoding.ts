/**
 * Types for WebCodecs video decoding
 */

export interface DecodeSessionConfig {
  /** Video source - URL string or ArrayBuffer */
  src: string | ArrayBuffer
  /** Start time in seconds (optional) */
  startTime?: number
  /** End time in seconds (optional) */
  endTime?: number
  /** Frame callback */
  onFrame?: (frame: VideoFrame, metadata: FrameMetadata) => void
  /** End callback */
  onEnd?: () => void
  /** Error callback */
  onError?: (error: Error) => void
  /** Metadata callback */
  onMetadata?: (metadata: VideoMetadata) => void
}

export interface FrameMetadata {
  /** Frame timestamp in microseconds */
  timestamp: number
  /** Frame duration in microseconds (optional) */
  duration?: number
  /** Sequential frame index */
  frameIndex: number
}

export interface VideoMetadata {
  /** Video duration in seconds */
  duration: number
  /** Video width in pixels */
  width: number
  /** Video height in pixels */
  height: number
  /** Frames per second */
  fps: number
  /** Video codec string */
  codec: string
}

export interface DecodeStats {
  /** Current frame queue size */
  queueSize: number
  /** Frames processed per second */
  fps?: number
  /** Average decode time per frame */
  avgDecodeTime?: number
}

/**
 * WebCodecs VideoFrame interface (subset)
 * This matches the WebCodecs API
 */
export interface VideoFrame {
  /** Frame timestamp in microseconds */
  timestamp: number
  /** Frame duration in microseconds (optional) */
  duration?: number
  /** Coded width in pixels */
  codedWidth: number
  /** Coded height in pixels */
  codedHeight: number
  /** Display width in pixels */
  displayWidth: number
  /** Display height in pixels */
  displayHeight: number
  /** Close the frame and free resources */
  close(): void
  /** Create a copy of the frame */
  clone(): VideoFrame
}
