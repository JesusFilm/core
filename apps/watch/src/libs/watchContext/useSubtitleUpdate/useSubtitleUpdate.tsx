import { useCallback } from 'react'
import { useLazyQuery } from '@apollo/client'
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

  const subtitleUpdate = useCallback(async ({
    player,
    subtitleLanguageId,
    subtitleOn
  }: SubtitleUpdateParams): Promise<void> => {
    // Check if player is still valid (not disposed)
    if (!player || !player.el || !player.el() || player.isDisposed?.() === true) {
      return
    }

    try {
      const tracks = player.textTracks?.() ?? new TextTrackList()

      if (subtitleOn !== true || subtitleLanguageId == null) {
        // Disable all subtitle tracks when subtitles should be off
        for (let i = 0; i < tracks.length; i++) {
          try {
            const track = tracks[i]
            if (track && track.kind === 'subtitles') {
              track.mode = 'disabled'
            }
          } catch (error) {
            // Track might be disposed, continue with others
            continue
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
            try {
              const track = tracks[i]
              if (track && track.kind === 'subtitles') {
                track.mode = 'disabled'
              }
            } catch (error) {
              // Track might be disposed, continue with others
              continue
            }
          }
          return
        }

        // Check if track with this ID already exists
        let existingTrack: TextTrack | null = null
        for (let i = 0; i < tracks.length; i++) {
          try {
            const track = tracks[i]
            if (track && track.id === subtitleLanguageId && track.kind === 'subtitles') {
              existingTrack = track
              break
            }
          } catch (error) {
            // Track might be disposed, continue with others
            continue
          }
        }

        // Only add track if it doesn't already exist
        if (existingTrack == null) {
          try {
            player.addRemoteTextTrack(
              {
                id: subtitleLanguageId,
                src: selected.value,
                kind: 'subtitles',
                srclang: selected.language.bcp47 ?? undefined,
                label: selected.language.name.at(0)?.value,
                mode: 'showing',
                default: true
              },
              true
            )
          } catch (error) {
            // Player might have been disposed during addRemoteTextTrack
            return
          }
        }

        // Update track modes: show selected language, disable others
        const updatedTracks = player.textTracks?.() ?? new TextTrackList()
        for (let i = 0; i < updatedTracks.length; i++) {
          try {
            const track = updatedTracks[i]
            if (track && track.kind === 'subtitles') {
              if (track.id === subtitleLanguageId) {
                track.mode = 'showing'
              } else {
                track.mode = 'disabled'
              }
            }
          } catch (error) {
            // Track might be disposed, continue with others
            continue
          }
        }
        return
      }
    } catch (error) {
      // Player or tracks might be disposed, silently fail
      return
    }
  }, [variant?.slug])

  return { subtitleUpdate, subtitlesLoading }
}
