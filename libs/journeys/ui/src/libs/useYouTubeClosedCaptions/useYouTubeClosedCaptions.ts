import { ApolloError, gql, useLazyQuery } from '@apollo/client'
import { useEffect } from 'react'

import {
  YouTubeClosedCaptionLanguages,
  YouTubeClosedCaptionLanguages_youtubeClosedCaptionLanguages_QueryYoutubeClosedCaptionLanguagesSuccess_data as YouTubeLanguage
} from './__generated__/YouTubeClosedCaptionLanguages'

export const YOUTUBE_CLOSED_CAPTION_LANGUAGES = gql`
  query YouTubeClosedCaptionLanguages($videoId: ID!) {
    youtubeClosedCaptionLanguages(videoId: $videoId) {
      __typename
      ... on QueryYoutubeClosedCaptionLanguagesSuccess {
        data {
          id
          bcp47
          name {
            value
            primary
          }
        }
      }
    }
  }
`

interface UseYouTubeClosedCaptionsOptions {
  videoId: string | null | undefined
  enabled?: boolean
}

interface UseYouTubeClosedCaptionsReturn {
  languages: YouTubeLanguage[]
  loading: boolean
  error: ApolloError | undefined
}

export function useYouTubeClosedCaptions({
  videoId,
  enabled = true
}: UseYouTubeClosedCaptionsOptions): UseYouTubeClosedCaptionsReturn {
  const [getClosedCaptions, { data, loading, error }] =
    useLazyQuery<YouTubeClosedCaptionLanguages>(
      YOUTUBE_CLOSED_CAPTION_LANGUAGES,
      {
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'cache-first'
      }
    )

  useEffect(() => {
    if (!enabled) return

    const sanitizedVideoId = videoId?.trim()
    if (sanitizedVideoId == null || sanitizedVideoId === '') return

    void getClosedCaptions({
      variables: { videoId }
    })
  }, [videoId, enabled, getClosedCaptions])

  const languages =
    data?.youtubeClosedCaptionLanguages?.__typename ===
    'QueryYoutubeClosedCaptionLanguagesSuccess'
      ? data.youtubeClosedCaptionLanguages.data
      : []

  return {
    languages,
    loading,
    error
  }
}
