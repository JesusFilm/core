import VideoJsPlayer from '../videoJsTypes'
import { YoutubeTech } from '../videoJsTypes/YoutubeTech'
import { isYoutubeTech } from '../videoStatsUtils/isYoutubeTech'

export function getYouTubePlayer(
  player: VideoJsPlayer
): YoutubeTech['ytPlayer'] | null {
  const tech = player.tech({ IWillNotUseThisInPlugins: true })

  if (isYoutubeTech(tech)) {
    return tech.ytPlayer
  }

  return null
}
