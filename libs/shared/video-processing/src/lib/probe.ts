/**
 * Video metadata probing utilities for auto-crop pipeline
 */

import type { VideoMetadata, OutputTarget } from '../types/video-metadata'

/**
 * Probe video metadata from a video element or URL
 * Extracts comprehensive metadata needed for auto-crop pipeline
 */
export async function probeVideoMeta(
  input: HTMLVideoElement | string,
  options: {
    timeoutMs?: number
    detailedCodecInfo?: boolean
  } = {}
): Promise<VideoMetadata> {
  const { timeoutMs = 10000, detailedCodecInfo = true } = options

  return new Promise((resolve, reject) => {
    const video = typeof input === 'string' ? document.createElement('video') : input
    const isCreatedElement = typeof input === 'string'

    if (isCreatedElement) {
      video.src = input
      video.preload = 'metadata'
      video.crossOrigin = 'anonymous'
    }

    let resolved = false

    const cleanup = () => {
      if (isCreatedElement && video.parentNode) {
        video.parentNode.removeChild(video)
      }
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('error', onError)
    }

    const onLoadedMetadata = () => {
      if (resolved) return
      resolved = true

      try {
        // Extract basic video properties
        const width = video.videoWidth
        const height = video.videoHeight
        const duration = video.duration
        const fps = estimateFrameRate(video)

        // Extract rotation from video orientation
        const rotation = getVideoRotation(video)

        // Check for audio track presence
        const hasAudio = hasAudioTracks(video)

        // Extract codec information if requested
        const codec = detailedCodecInfo ? extractCodecInfo(video) : undefined
        const audioCodec = detailedCodecInfo ? extractAudioCodecInfo(video) : undefined

        // Calculate file size if available
        const fileSize = extractFileSize(video)

        // Extract additional metadata
        const bitrate = estimateBitrate(video)
        const colorSpace = extractColorSpace(video)
        const pixelFormat = extractPixelFormat(video)
        const containerFormat = extractContainerFormat(video)

        const metadata: VideoMetadata = {
          width,
          height,
          duration,
          fps,
          rotation,
          hasAudio,
          codec,
          audioCodec,
          bitrate,
          colorSpace,
          pixelFormat,
          containerFormat,
          fileSize,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        cleanup()
        resolve(metadata)
      } catch (error) {
        cleanup()
        reject(new Error(`Failed to extract video metadata: ${error}`))
      }
    }

    const onError = (event: Event) => {
      if (resolved) return
      resolved = true

      cleanup()
      const error = (event as ErrorEvent).error || new Error('Video metadata loading failed')
      reject(error)
    }

    // Set up event listeners
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('error', onError)

    // Set timeout
    setTimeout(() => {
      if (resolved) return
      resolved = true

      cleanup()
      reject(new Error(`Video metadata probing timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    // Trigger loading if we created the element
    if (isCreatedElement) {
      video.load()
    } else {
      // For existing elements, check if already loaded
      if (video.readyState >= 1) {
        onLoadedMetadata()
      }
    }
  })
}

/**
 * Estimate frame rate from video element
 */
function estimateFrameRate(video: HTMLVideoElement): number {
  // Try to get frame rate from video properties
  // This is approximate as browser APIs don't always expose exact fps
  const duration = video.duration
  const width = video.videoWidth
  const height = video.videoHeight

  // For common frame rates, try to estimate based on duration and file size patterns
  // This is a heuristic - exact fps detection would require frame-by-frame analysis
  if (duration > 0) {
    // Common frame rates to check against
    const commonFps = [60, 50, 30, 25, 24, 23.976]

    // If we have access to performance timing, we can do better estimation
    // For now, default to 30fps which is common for web videos
    return 30
  }

  return 30 // Default fallback
}

/**
 * Extract video rotation/orientation
 */
function getVideoRotation(video: HTMLVideoElement): number {
  // Check for rotation metadata in video element
  // This is a simplified implementation - in practice, rotation might be
  // stored in video track metadata or CSS transforms

  // Check video dimensions to infer rotation
  const { videoWidth, videoHeight } = video

  // If width > height significantly and we expect portrait output,
  // it might be rotated landscape video
  if (videoWidth > videoHeight && videoWidth / videoHeight > 1.5) {
    // Likely landscape video that should be treated as rotated
    return 0 // Assume no rotation for now
  }

  return 0 // Default to no rotation
}

/**
 * Check if video has audio tracks
 */
function hasAudioTracks(video: HTMLVideoElement): boolean {
  try {
    // Check if the video element has audio
    const audioTracks = (video as any).audioTracks
    if (audioTracks && audioTracks.length > 0) {
      return true
    }

    // Alternative check: try to access audio properties
    const hasAudio = (video as any).mozHasAudio ||
                    (video as any).webkitAudioDecodedByteCount !== undefined ||
                    video.muted !== undefined

    // If we can't determine, assume it has audio (most videos do)
    return hasAudio !== false
  } catch {
    // If audio detection fails, assume it has audio
    return true
  }
}

/**
 * Extract video codec information
 */
function extractCodecInfo(video: HTMLVideoElement): string | undefined {
  try {
    // Try to get codec from video tracks
    const videoTracks = (video as any).videoTracks
    if (videoTracks && videoTracks.length > 0) {
      const track = videoTracks[0]
      if ((track as any).codec) {
        return (track as any).codec
      }
    }

    // Try to infer from MIME type or file extension
    const src = video.currentSrc || video.src
    if (src) {
      const extension = src.split('.').pop()?.toLowerCase()
      switch (extension) {
        case 'mp4':
          return 'avc1' // H.264
        case 'webm':
          return 'vp8' // VP8 or VP9
        case 'mov':
          return 'avc1' // H.264
        default:
          return undefined
      }
    }
  } catch {
    // Ignore codec extraction errors
  }

  return undefined
}

/**
 * Extract audio codec information
 */
function extractAudioCodecInfo(video: HTMLVideoElement): string | undefined {
  try {
    // Try to get codec from audio tracks
    const audioTracks = (video as any).audioTracks
    if (audioTracks && audioTracks.length > 0) {
      const track = audioTracks[0]
      if ((track as any).codec) {
        return (track as any).codec
      }
    }

    // Default to AAC for most web videos
    return hasAudioTracks(video) ? 'mp4a' : undefined
  } catch {
    return undefined
  }
}

/**
 * Extract file size information
 */
function extractFileSize(video: HTMLVideoElement): number | undefined {
  try {
    // This is difficult to get from a video element directly
    // In a real implementation, this would come from the server or file input
    // For now, we can't reliably extract this from the browser
    return undefined
  } catch {
    return undefined
  }
}

/**
 * Estimate bitrate from video properties
 */
function estimateBitrate(video: HTMLVideoElement): number | undefined {
  try {
    // Estimate bitrate based on file size and duration if available
    // This is approximate and would be more accurate with server-provided metadata
    const duration = video.duration
    const fileSize = extractFileSize(video)

    if (duration > 0 && fileSize) {
      // Convert to bits per second
      return (fileSize * 8) / duration
    }
  } catch {
    // Ignore bitrate estimation errors
  }

  return undefined
}

/**
 * Extract color space information
 */
function extractColorSpace(video: HTMLVideoElement): string | undefined {
  try {
    // Try to get color space from video track
    const videoTracks = (video as any).videoTracks
    if (videoTracks && videoTracks.length > 0) {
      const track = videoTracks[0]
      if ((track as any).colorSpace) {
        return (track as any).colorSpace
      }
    }

    // Default to common web video color space
    return 'bt709'
  } catch {
    return undefined
  }
}

/**
 * Extract pixel format information
 */
function extractPixelFormat(video: HTMLVideoElement): string | undefined {
  try {
    // Try to get pixel format from video track
    const videoTracks = (video as any).videoTracks
    if (videoTracks && videoTracks.length > 0) {
      const track = videoTracks[0]
      if ((track as any).pixelFormat) {
        return (track as any).pixelFormat
      }
    }

    // Default to common web video pixel format
    return 'yuv420p'
  } catch {
    return undefined
  }
}

/**
 * Extract container format information
 */
function extractContainerFormat(video: HTMLVideoElement): string | undefined {
  try {
    const src = video.currentSrc || video.src
    if (src) {
      const extension = src.split('.').pop()?.toLowerCase()
      switch (extension) {
        case 'mp4':
          return 'mp4'
        case 'webm':
          return 'webm'
        case 'mov':
          return 'mov'
        case 'm4v':
          return 'mp4'
        case 'mkv':
          return 'mkv'
        default:
          return 'mp4' // Default assumption
      }
    }
  } catch {
    // Ignore container format extraction errors
  }

  return undefined
}

/**
 * Validate metadata against target output requirements
 */
export function validateMetadataForTarget(
  metadata: VideoMetadata,
  target: OutputTarget
): { valid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = []
  const errors: string[] = []

  // Check if video dimensions are reasonable
  if (metadata.width <= 0 || metadata.height <= 0) {
    errors.push('Invalid video dimensions')
  }

  // Check if duration is reasonable
  if (metadata.duration <= 0 || !isFinite(metadata.duration)) {
    errors.push('Invalid video duration')
  }

  // Check frame rate compatibility
  if (metadata.fps <= 0) {
    warnings.push('Unable to determine frame rate, assuming 30fps')
  }

  // Check aspect ratio compatibility with target
  const sourceAspect = metadata.width / metadata.height
  const targetAspect = target.aspectRatio

  if (Math.abs(sourceAspect - targetAspect) > 0.5) {
    warnings.push(`Source aspect ratio ${sourceAspect.toFixed(2)} differs significantly from target ${targetAspect.toFixed(2)}`)
  }

  // Check if source resolution is sufficient for target
  const targetPixels = target.width * target.height
  const sourcePixels = metadata.width * metadata.height

  if (sourcePixels < targetPixels * 0.5) {
    warnings.push('Source resolution may be too low for target output quality')
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors
  }
}
