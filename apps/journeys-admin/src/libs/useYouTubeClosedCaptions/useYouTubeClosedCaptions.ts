import { ApolloError, gql, useLazyQuery } from '@apollo/client'
import { useEffect } from 'react'

import {
  GetYouTubeClosedCaptionLanguageIds,
  GetYouTubeClosedCaptionLanguageIds_getYouTubeClosedCaptionLanguageIds as YouTubeLanguage
} from '../../../__generated__/GetYouTubeClosedCaptionLanguageIds'

export type { YouTubeLanguage }

export const GET_YOUTUBE_CLOSED_CAPTION_LANGUAGE_IDS = gql`
  query GetYouTubeClosedCaptionLanguageIds($videoId: ID!) {
    getYouTubeClosedCaptionLanguageIds(videoId: $videoId) {
      id
      bcp47
      name {
        value
        primary
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
    useLazyQuery<GetYouTubeClosedCaptionLanguageIds>(
      GET_YOUTUBE_CLOSED_CAPTION_LANGUAGE_IDS,
      {
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'cache-first'
      }
    )

  useEffect(() => {
    if (enabled && videoId != null) {
      void getClosedCaptions({
        variables: { videoId }
      })
    }
  }, [videoId, enabled, getClosedCaptions])

  return {
    languages: data?.getYouTubeClosedCaptionLanguageIds ?? [],
    loading,
    error
  }
}
