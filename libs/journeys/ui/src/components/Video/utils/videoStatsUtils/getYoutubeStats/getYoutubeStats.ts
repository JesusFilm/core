import { TFunction } from 'next-i18next'

import { YoutubeTech } from '../../../utils/videoJsTypes/YoutubeTech'
import { getYoutubeQualityMap } from '../../../utils/youtubeQualityMap'

/**
 * Gets YouTube video statistics
 * @param tech The YouTube tech instance
 * @param t Translation function
 * @returns Object containing YouTube video statistics
 */
export function getYoutubeStats(
  tech: YoutubeTech,
  t: TFunction
): {
  currentQuality: string
  bufferedPercent: number
} {
  const ytPlayer = tech.ytPlayer

  // Get YouTube video quality
  const quality = ytPlayer?.getPlaybackQuality() || '-'

  // Get buffered percentage
  const bufferedPercent = ytPlayer?.getVideoLoadedFraction() || 0

  // Use the quality indicator from YouTube
  const qualityMap = getYoutubeQualityMap(t)
  const displayQuality = qualityMap[quality] || quality

  return {
    currentQuality: displayQuality || '-',
    bufferedPercent: Math.round(bufferedPercent * 100) || 0
  }
}
