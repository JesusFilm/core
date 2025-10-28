import { ApolloError, gql, useQuery } from '@apollo/client'

import {
  YouTubeClosedCaptionLanguages,
  YouTubeClosedCaptionLanguages_youtubeClosedCaptionLanguages_QueryYoutubeClosedCaptionLanguagesSuccess_data as YouTubeLanguage
} from './__generated__/YouTubeClosedCaptionLanguages'

export type { YouTubeLanguage }

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
  skip?: boolean
}

interface UseYouTubeClosedCaptionsReturn {
  languages: YouTubeLanguage[]
  loading: boolean
  error: ApolloError | undefined
}

export function useYouTubeClosedCaptions({
  videoId,
  skip = false
}: UseYouTubeClosedCaptionsOptions): UseYouTubeClosedCaptionsReturn {
  const { data, loading, error } = useQuery<YouTubeClosedCaptionLanguages>(
    YOUTUBE_CLOSED_CAPTION_LANGUAGES,
    {
      skip: skip || videoId == null,
      variables: { videoId }
    }
  )

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
