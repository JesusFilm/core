import VideoJsPlayer from '../../utils/videoJsTypes'
import { Html5 } from '../../utils/videoJsTypes/Html5'
import { YoutubeTech } from '../../utils/videoJsTypes/YoutubeTech'
import { getYoutubeQualityMap } from '../youtubeQualityMap'

/**
 * Type guard to check if a tech is YouTube tech
 * @param tech The tech to check
 * @returns True if the tech is YouTube tech
 */
export function isYoutubeTech(tech: Html5 | YoutubeTech): tech is YoutubeTech {
  return tech?.name_ === 'Youtube'
}

/**
 * Type guard to check if a tech is HTML5 tech
 * @param tech The tech to check
 * @returns True if the tech is HTML5 tech
 */
export function isHtml5Tech(tech: Html5 | YoutubeTech): tech is Html5 {
  return tech?.name_ === 'Html5'
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
 * Gets the current video quality as a string for HTML5 video
 * @param player The video.js player instance
 * @returns The current video quality or '-' if not available
 */
export function getHtml5CurrentQuality(player?: VideoJsPlayer): string {
  if (!player) return '-'

  const qualityLevels = player.qualityLevels()

  if (qualityLevels?.length > 0 && qualityLevels.selectedIndex >= 0) {
    const selectedLevel = qualityLevels[qualityLevels.selectedIndex]
    return selectedLevel ? `${selectedLevel.height}p` : '-'
  }

  return '-'
}

/**
 * Gets the current frame rate of the HTML5 video
 * @param player The video.js player instance
 * @returns The frame rate as a number or a string message if not available
 */
export function getHtml5FrameRate(player: VideoJsPlayer): string | number {
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
 * Calculates the video bitrate for HTML5 video based on media segment statistics or falls back to bandwidth
 * @param player The video.js player instance
 * @returns The calculated bitrate in kbps or 0 if not available
 */
export function calculateHtml5Bitrate(player: VideoJsPlayer): number {
  if (!player) return 0

  const tech = player.tech({ IWillNotUseThisInPlugins: true })
  if (!isHtml5Tech(tech)) return 0

  const vhs = tech.vhs
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

/**
 * Gets YouTube video statistics
 * @param tech The YouTube tech instance
 * @returns Object containing YouTube video statistics
 */
export function getYoutubeStats(tech: YoutubeTech): {
  currentQuality: string
  bufferedPercent: number
} {
  const ytPlayer = tech.ytPlayer

  // Get YouTube video quality
  const quality = ytPlayer?.getPlaybackQuality() || '-'

  // Get buffered percentage
  const bufferedPercent = ytPlayer?.getVideoLoadedFraction() || 0

  // Use the quality indicator from YouTube
  const qualityMap = getYoutubeQualityMap()
  const displayQuality = qualityMap[quality] || quality

  return {
    currentQuality: displayQuality || '-',
    bufferedPercent: Math.round(bufferedPercent * 100) || 0
  }
}

/**
 * Gets HTML5 video statistics
 * @param player The video.js player instance
 * @returns Object containing HTML5 video statistics
 */
export function getHtml5Stats(player: VideoJsPlayer): {
  measuredBitrate: number | string
  currentQuality: string
  currentFrameRate: string | number
} {
  return {
    measuredBitrate: calculateHtml5Bitrate(player) || '-',
    currentQuality: getHtml5CurrentQuality(player) || '-',
    currentFrameRate: getHtml5FrameRate(player) || '-'
  }
}
