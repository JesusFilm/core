import Player from 'video.js/dist/types/player'

export interface Vhs {
  stats?: {
    bandwidth?: number
    streamBitrate?: number
    mediaBytesTransferred?: number
    mediaRequests?: number
    mediaRequestsAborted?: number
    mediaTransferDuration?: number
  }
  bandwidth?: number
  streamBitrate?: number
}

/**
 * Formats a TimeRanges object into a readable string
 * @param timeRanges The TimeRanges object to format
 * @returns A string representation of the time ranges
 */
export function formatTimeRanges(timeRanges?: TimeRanges | null): string {
  if (!timeRanges) return '-'

  const ranges = []
  for (let i = 0; i < timeRanges.length; i++) {
    ranges.push(
      `${formatTime(timeRanges.start(i))}-${formatTime(timeRanges.end(i))}`
    )
  }
  return ranges.join(', ')
}

/**
 * Formats seconds into a MM:SS format
 * @param seconds The number of seconds to format
 * @returns A string in MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Gets the current video quality as a string in the format "widthxheight"
 * @returns The current video quality or an empty string if not available
 */
export function getCurrentQuality(): string {
  const videoEl = document.querySelector('video')
  if (!videoEl) return ''

  const width = videoEl.videoWidth
  const height = videoEl.videoHeight
  return width && height ? `${width}x${height}` : ''
}

/**
 * Gets the current frame rate of the video
 * @param player The video.js player instance
 * @returns The frame rate as a number or a string message if not available
 */
export function getLiveFrameRate(player: Player): string | number {
  const videoEl = player.el().querySelector('video')
  if (!videoEl) return 'No video element'

  const time = player.currentTime() || 0
  if (time <= 0) return 'Buffering...'

  // Try different methods to get frame rate in order of preference
  if ('getVideoPlaybackQuality' in videoEl) {
    const quality = (videoEl as any).getVideoPlaybackQuality()
    const frames = quality?.totalVideoFrames
    if (frames > 0) return Math.round(frames / time)
  }

  if ('webkitDecodedFrameCount' in videoEl) {
    const frames = (videoEl as any).webkitDecodedFrameCount
    if (frames > 0) return Math.round(frames / time)
  }

  if ('mozParsedFrames' in videoEl) {
    const frames = (videoEl as any).mozParsedFrames
    if (frames > 0) return Math.round(frames / time)
  }

  return 'Not available'
}

/**
 * Calculates the video bitrate based on media segment statistics or falls back to bandwidth
 * @param vhs The VHS object from the player's tech
 * @returns The calculated bitrate in kbps or 0 if not available
 */
export function calculateBitrate(vhs: Vhs | undefined): number {
  if (!vhs) return 0

  // Calculate bitrate from media segments if stats are available
  let calculatedBitrate = 0

  if (
    vhs.stats?.mediaBytesTransferred &&
    vhs.stats?.mediaRequests &&
    vhs.stats?.mediaTransferDuration
  ) {
    // Calculate bitrate from bytes transferred and transfer duration
    // Convert bytes to bits (multiply by 8) and seconds to milliseconds (divide by 1000)
    // Then convert to kbps (divide by 1000 again)
    const mediaRequests = Math.max(
      1,
      vhs.stats.mediaRequests - (vhs.stats.mediaRequestsAborted || 0)
    )
    const bytesPerSegment = vhs.stats.mediaBytesTransferred / mediaRequests
    const transferDurationSec = vhs.stats.mediaTransferDuration / 1000

    if (transferDurationSec > 0) {
      // bits per second / 1000 = kbps
      calculatedBitrate = Math.round(
        (bytesPerSegment * 8) / transferDurationSec / 1000
      )
    }
  }

  // Fall back to bandwidth if segment calculation isn't available
  if (calculatedBitrate <= 0) {
    calculatedBitrate = vhs.bandwidth || 0
  }

  return calculatedBitrate
}
