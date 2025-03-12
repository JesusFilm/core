import VideoJsPlayer from '../../../utils/videoJsTypes'
import { isHtml5Tech } from '../isHtml5Tech'

/**
 * Calculates the video bitrate for HTML5 video based on media segment statistics or falls back to bandwidth
 * @param player The video.js player instance
 * @returns The calculated bitrate in kbps or 0 if not available
 */
export function calculateHtml5Bitrate(player?: VideoJsPlayer): number {
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
