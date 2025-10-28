import type { YouTubeClosedCaptionLanguages_youtubeClosedCaptionLanguages_QueryYoutubeClosedCaptionLanguagesSuccess_data as YouTubeLanguage } from '../../../../libs/useYouTubeClosedCaptions/__generated__/YouTubeClosedCaptionLanguages'
import { VideoFields_subtitleLanguage as SubtitleLanguage } from '../../__generated__/VideoFields'
import { getYouTubePlayer } from '../getYouTubePlayer'
import { removeAllRemoteTextTracks } from '../removeAllRemoteTextTracks'
import { setYouTubeCaptionTrack } from '../setYouTubeCaptionTrack'
import VideoJsPlayer from '../videoJsTypes'

interface AddYouTubeSubtitlesParams {
  player: VideoJsPlayer
  languages: YouTubeLanguage[]
  subtitleLanguage: SubtitleLanguage | null
}

export function addYouTubeSubtitles({
  player,
  languages,
  subtitleLanguage
}: AddYouTubeSubtitlesParams): void {
  // Remove all existing remote text tracks to prevent duplicates on re-render
  removeAllRemoteTextTracks(player)

  languages.forEach((language: YouTubeLanguage) => {
    if (language.bcp47 != null && language.name?.[0]?.value != null) {
      player.addRemoteTextTrack(
        {
          id: language.id,
          kind: 'captions',
          srclang: language.bcp47,
          label: language.name[0].value,
          mode: subtitleLanguage?.id === language.id ? 'showing' : 'hidden'
        },
        true
      )
    }
    if (subtitleLanguage?.id === language.id && language.bcp47 != null) {
      const ytPlayer = getYouTubePlayer(player)
      setYouTubeCaptionTrack(ytPlayer, language.bcp47)
    }
  })
}
