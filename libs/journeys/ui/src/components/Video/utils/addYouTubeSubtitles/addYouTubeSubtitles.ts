import type { YouTubeClosedCaptionLanguages_youtubeClosedCaptionLanguages_QueryYoutubeClosedCaptionLanguagesSuccess_data as YouTubeLanguage } from '../../../../libs/useYouTubeClosedCaptions/__generated__/YouTubeClosedCaptionLanguages'
import VideoJsPlayer from '../videoJsTypes'

interface AddYouTubeSubtitlesParams {
  player: VideoJsPlayer
  languages: YouTubeLanguage[]
}

export function addYouTubeSubtitles({
  player,
  languages
}: AddYouTubeSubtitlesParams): void {
  languages.forEach((language: YouTubeLanguage) => {
    if (language.bcp47 != null && language.name?.[0]?.value != null) {
      player.addRemoteTextTrack(
        {
          id: language.id,
          kind: 'captions',
          srcLang: language.bcp47,
          label: language.name[0].value,
          mode: 'hidden'
        },
        true
      )
    }
  })
}
