import { VideoFields_subtitleLanguage as SubtitleLanguage } from '../../__generated__/VideoFields'
import { getYouTubePlayer } from '../getYouTubePlayer'
import { removeAllRemoteTextTracks } from '../removeAllRemoteTextTracks'
import { setYouTubeCaptionTrack } from '../setYouTubeCaptionTrack'
import { unloadYouTubeCaptions } from '../unloadYouTubeCaptions'
import VideoJsPlayer from '../videoJsTypes'
import { YoutubeCaptionLanguages } from '../videoJsTypes/YoutubeTech'

interface ExtractYouTubeCaptionsAndAddTextTracksParams {
  player: VideoJsPlayer
  subtitleLanguage: SubtitleLanguage | null
}

function matchesLanguageCode(
  bcp47: string | null | undefined,
  languageCode: string
): boolean {
  if (bcp47 == null) return false
  return (
    languageCode === bcp47 ||
    languageCode.startsWith(`${bcp47}-`)
  )
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
  // Unload YouTube captions to prevent duplicates
  unloadYouTubeCaptions(ytPlayer)

  let captionTrackSet = false

  languages.forEach((language: YoutubeCaptionLanguages) => {
    if (language.languageCode != null && language.languageName != null) {
      const isMatch =
        !captionTrackSet &&
        matchesLanguageCode(subtitleLanguage?.bcp47, language.languageCode)

      player.addRemoteTextTrack(
        {
          id: language.id,
          kind: 'captions',
          srclang: language.languageCode,
          label: language.languageName,
          mode: isMatch ? 'showing' : 'hidden'
        },
        true
      )

      if (isMatch) {
        setYouTubeCaptionTrack(ytPlayer, language.languageCode)
        captionTrackSet = true
      }
    }
  })
}
