import { VideoFields_subtitleLanguage as SubtitleLanguage } from '../../__generated__/VideoFields'
import { getYouTubePlayer } from '../getYouTubePlayer'
import { removeAllRemoteTextTracks } from '../removeAllRemoteTextTracks'
import { setYouTubeCaptionTrack } from '../setYouTubeCaptionTrack'
import VideoJsPlayer from '../videoJsTypes'
import { YoutubeCaptionLanguages } from '../videoJsTypes/YoutubeTech'

interface ExtractYouTubeCaptionsAndAddTextTracksParams {
  player: VideoJsPlayer
  subtitleLanguage: SubtitleLanguage | null
}

export function extractYouTubeCaptionsAndAddTextTracks({
  player,
  subtitleLanguage
}: ExtractYouTubeCaptionsAndAddTextTracksParams): void {
  const ytPlayer = getYouTubePlayer(player)
  if (ytPlayer == null) return

  const languages = ytPlayer.getOption?.('captions', 'tracklist') ?? []
  // Remove all existing remote text tracks to prevent duplicates on re-render
  removeAllRemoteTextTracks(player)

  languages.forEach((language: YoutubeCaptionLanguages) => {
    if (language.languageCode != null && language.languageName != null) {
      player.addRemoteTextTrack(
        {
          id: language.id,
          kind: 'captions',
          srclang: language.languageCode,
          label: language.languageName,
          mode:
            subtitleLanguage?.bcp47 === language.languageCode
              ? 'showing'
              : 'hidden'
        },
        true
      )
    }
    if (subtitleLanguage?.bcp47 === language.languageCode) {
      setYouTubeCaptionTrack(ytPlayer, language.languageCode)
    }
  })
}
