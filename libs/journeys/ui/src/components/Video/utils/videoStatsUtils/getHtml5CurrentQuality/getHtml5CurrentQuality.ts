import VideoJsPlayer from '../../../utils/videoJsTypes'

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
