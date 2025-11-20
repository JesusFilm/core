import { useLazyQuery } from '@apollo/client'
import { useCallback } from 'react'
import Player from 'video.js/dist/types/player'

import { graphql } from '@core/shared/gql'

import { useVideo } from '../../videoContext'

export const GET_SUBTITLES = graphql(`
  query GetSubtitles($id: ID!) {
    video(id: $id, idType: slug) {
      variant {
        subtitle {
          language {
            name(primary: true) {
              value
            }
            bcp47
            id
          }
          value
        }
      }
    }
  }
`)

interface SubtitleUpdateParams {
  player: Player & { textTracks?: () => TextTrackList }
  subtitleLanguageId?: string | null
  subtitleOn?: boolean
}

export function useSubtitleUpdate() {
  const [getSubtitleLanguages, { loading: subtitlesLoading }] =
    useLazyQuery(GET_SUBTITLES)
  const { variant } = useVideo()

  const subtitleUpdate = useCallback(
    async ({
      player,
      subtitleLanguageId,
      subtitleOn
    }: SubtitleUpdateParams): Promise<void> => {
      // Guard against invalid player state
      if (!player || !player.el_ || !player.el_.parentNode) {
        console.warn('Skipping subtitle update: player or element is invalid')
        return
      }

      const tracks = player.textTracks?.() ?? new TextTrackList()

      if (subtitleOn !== true || subtitleLanguageId == null) {
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
        const { data } = await getSubtitleLanguages({
          variables: { id: variant.slug }
        })

        const selected = data?.video?.variant?.subtitle?.find(
          (subtitle) => subtitle.language.id === subtitleLanguageId
        )

        if (selected == null) {
          // Disable all subtitle tracks when subtitle language is not found
          for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i]
            if (track.kind === 'subtitles') {
              track.mode = 'disabled'
            }
          }
          return
        }

        // Additional guard before adding remote text track
        if (!player || !player.el_ || !player.el_.parentNode) {
          console.warn(
            'Cannot add remote text track: player or element is invalid'
          )
          return
        }

        try {
          player.addRemoteTextTrack(
            {
              id: subtitleLanguageId,
              src: selected.value,
              kind: 'subtitles',
              srclang: selected.language.bcp47 ?? undefined,
              label: selected.language.name.at(0)?.value,
              mode: 'hidden',
              default: true
            },
            true
          )
        } catch (error) {
          console.warn('Error adding remote text track:', error)
        }

        // Update track modes: show selected language, disable others
        try {
          const updatedTracks = player.textTracks?.() ?? new TextTrackList()
          for (let i = 0; i < updatedTracks.length; i++) {
            const track = updatedTracks[i]
            if (track.kind === 'subtitles') {
              if (track.id === subtitleLanguageId) {
                track.mode = 'hidden'
              } else {
                track.mode = 'disabled'
              }
            }
          }
        } catch (error) {
          console.warn('Error updating track modes:', error)
        }
        return
      }
    },
    [getSubtitleLanguages, variant]
  )

  return { subtitleUpdate, subtitlesLoading }
}
