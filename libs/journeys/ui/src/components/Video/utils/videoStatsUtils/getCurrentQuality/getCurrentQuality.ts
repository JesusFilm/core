import { TFunction } from 'next-i18next'

import VideoJsPlayer from '../../../utils/videoJsTypes'
import { getYoutubeQualityMap } from '../../../utils/youtubeQualityMap'
import { isHtml5Tech } from '../isHtml5Tech'
import { isYoutubeTech } from '../isYoutubeTech'

interface GetCurrentQualityProps {
  player?: VideoJsPlayer
  t: TFunction
}

/**
 * Gets the current video quality as a string for both HTML5 and YouTube videos
 * @param props Object containing player and translation function
 * @returns The current video quality or '-' if not available
 */
export function getCurrentQuality({
  player,
  t
}: GetCurrentQualityProps): string {
  if (!player) return '-'

  const tech = player.tech({ IWillNotUseThisInPlugins: true })

  // Handle YouTube videos
  if (isYoutubeTech(tech)) {
    const ytPlayer = tech.ytPlayer
    if (!ytPlayer) return '-'

    // Get YouTube video quality
    const quality = ytPlayer.getPlaybackQuality() || '-'

    // Use the quality indicator from YouTube
    const qualityMap = getYoutubeQualityMap(t)
    const displayQuality = qualityMap[quality] || quality

    return displayQuality
  }

  // Handle HTML5 videos
  if (isHtml5Tech(tech)) {
    const qualityLevels = player.qualityLevels()

    if (qualityLevels?.length > 0 && qualityLevels.selectedIndex >= 0) {
      const selectedLevel = qualityLevels[qualityLevels.selectedIndex]
      return selectedLevel ? `${selectedLevel.height}p` : '-'
    }
  }

  return '-'
}
