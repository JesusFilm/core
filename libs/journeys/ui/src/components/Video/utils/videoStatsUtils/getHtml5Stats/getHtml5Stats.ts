import VideoJsPlayer from '../../../utils/videoJsTypes'
import { calculateHtml5Bitrate } from '../calculateHtml5Bitrate'
import { getHtml5CurrentQuality } from '../getHtml5CurrentQuality'
import { getHtml5FrameRate } from '../getHtml5FrameRate'

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
