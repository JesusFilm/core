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
  preferredSubtitleLanguageIds?: Array<string | null | undefined>
  debugAvailableLanguages?: boolean
}

export function useSubtitleUpdate() {
  const [getSubtitleLanguages, { loading: subtitlesLoading }] =
    useLazyQuery(GET_SUBTITLES)
  const { variant } = useVideo()

  const subtitleUpdate = useCallback(
    async ({
      player,
      subtitleLanguageId,
      subtitleOn,
      preferredSubtitleLanguageIds,
      debugAvailableLanguages
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

        if (debugAvailableLanguages) {
          const available = data?.video?.variant?.subtitle?.map((subtitle) => ({
            id: subtitle.language.id,
            bcp47: subtitle.language.bcp47 ?? undefined,
            name: subtitle.language.name.at(0)?.value
          }))
          console.log('Carousel subtitle languages:', available ?? [])
        }

        const subtitles = data?.video?.variant?.subtitle ?? []
        const preferredIds =
          preferredSubtitleLanguageIds?.filter(
            (id): id is string => typeof id === 'string' && id.length > 0
          ) ?? []
        const fallbackIds =
          subtitleLanguageId != null ? [subtitleLanguageId] : []
        const candidateIds = preferredIds.length > 0 ? preferredIds : fallbackIds
        const activeSubtitle = candidateIds
          .map((id) => subtitles.find((subtitle) => subtitle.language.id === id))
          .find((subtitle) => subtitle != null)
        const activeLanguageId = activeSubtitle?.language.id
        const activeLanguageCode = activeSubtitle?.language.bcp47 ?? undefined
        const activeLanguageLabel = activeSubtitle?.language.name.at(0)?.value

        if (activeSubtitle == null || activeLanguageId == null) {
          // Disable all subtitle tracks when no subtitles are available
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
              id: activeLanguageId,
              src: activeSubtitle.value,
              kind: 'subtitles',
              srclang: activeLanguageCode,
              label: activeLanguageLabel,
              mode: 'showing',
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
              const isActive =
                (activeLanguageId != null && track.id === activeLanguageId) ||
                (activeLanguageCode != null &&
                  track.language === activeLanguageCode) ||
                (activeLanguageLabel != null &&
                  track.label === activeLanguageLabel)
              track.mode = isActive ? 'showing' : 'disabled'
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
