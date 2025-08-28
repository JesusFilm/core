import { useCallback } from 'react'
import Player from 'video.js/dist/types/player'

import {
  GetSubtitles,
  GetSubtitles_video_variant_subtitle as SubtitleLanguage
} from '../../../../__generated__/GetSubtitles'
import { gql, useLazyQuery } from '@apollo/client'
import { useVideo } from '../../videoContext'

export const GET_SUBTITLES = gql`
  query GetSubtitles($id: ID!) {
    video(id: $id, idType: slug) {
      variant {
        subtitle {
          language {
            name {
              value
              primary
            }
            bcp47
            id
          }
          value
        }
      }
    }
  }
`

interface SubtitleUpdateParams {
  player: Player & { textTracks?: () => TextTrackList }
  subtitleLanguage: string | null
  subtitleOn: boolean
  autoSubtitle?: boolean | null
}

export function useSubtitleUpdate() {
  const [getSubtitleLanguages, { loading: subtitlesLoading }] =
    useLazyQuery<GetSubtitles>(GET_SUBTITLES)
  const { variant } = useVideo()

  const subtitleUpdate = useCallback(
    async ({
      player,
      subtitleLanguage,
      subtitleOn,
      autoSubtitle
    }: SubtitleUpdateParams): Promise<void> => {
      if (player == null) return

      const tracks = player.textTracks?.() ?? []

      // Use autoSubtitle if available (based on availability), otherwise fall back to user preference
      const shouldShowSubtitles = autoSubtitle ?? subtitleOn

      if (!shouldShowSubtitles || subtitleLanguage == null) {
        // Disable all subtitle tracks when subtitles should be off
        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i]
          if (track.kind === 'subtitles') {
            track.mode = 'disabled'
          }
        }
        return
      }

      // Fetch subtitle data for the specific language
      if (variant?.slug) {
        await getSubtitleLanguages({
          variables: { id: variant.slug },
          onCompleted: (data) => {
            const selected = data?.video?.variant?.subtitle?.find(
              (subtitle) => subtitle.language.id === subtitleLanguage
            )

            if (selected == null) return

            // Check if track with this ID already exists
            let existingTrack: TextTrack | null = null
            for (let i = 0; i < tracks.length; i++) {
              const track = tracks[i]
              if (track.id === subtitleLanguage) {
                existingTrack = track
                break
              }
            }

            // If track doesn't exist, add it
            if (existingTrack == null) {
              player.addRemoteTextTrack(
                {
                  id: subtitleLanguage,
                  src: selected.value,
                  kind: 'subtitles',
                  language:
                    selected.language.bcp47 === null
                      ? undefined
                      : selected.language.bcp47,
                  label: selected.language.name
                    .map((name) => name.value)
                    .join(', '),
                  mode: 'showing',
                  default: true
                },
                true
              )
            }

            // Update track modes: show selected language, disable others
            const updatedTracks = player.textTracks?.() ?? []
            for (let i = 0; i < updatedTracks.length; i++) {
              const track = updatedTracks[i]
              if (track.kind === 'subtitles') {
                if (track.id === subtitleLanguage) {
                  track.mode = 'showing'
                } else {
                  track.mode = 'disabled'
                }
              }
            }
          }
        })
        return
      }
    },
    [variant?.slug, getSubtitleLanguages]
  )

  return { subtitleUpdate, subtitlesLoading }
}
