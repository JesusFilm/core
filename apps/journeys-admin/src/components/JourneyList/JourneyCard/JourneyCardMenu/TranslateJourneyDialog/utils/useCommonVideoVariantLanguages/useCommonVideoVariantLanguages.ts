import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'

import { SUPPORTED_LANGUAGE_IDS } from '@core/journeys/ui/useJourneyAiTranslateMutation/supportedLanguages'
import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'

import { GetAdminJourneys_journeys as AdminJourney } from '../../../../../../../../__generated__/GetAdminJourneys'
import {
  GetJourneyInternalVideos,
  GetJourneyInternalVideosVariables
} from '../../../../../../../../__generated__/GetJourneyInternalVideos'
import {
  GetVideosVariantLanguages,
  GetVideosVariantLanguagesVariables
} from '../../../../../../../../__generated__/GetVideosVariantLanguages'
import { JourneyFields } from '../../../../../../../../__generated__/JourneyFields'

export const GET_JOURNEY_INTERNAL_VIDEOS = gql`
  query GetJourneyInternalVideos($journeyId: ID!) {
    journey(id: $journeyId, idType: databaseId) {
      id
      blocks {
        id
        ... on VideoBlock {
          id
          videoId
          videoVariantLanguageId
          source
        }
      }
    }
  }
`

export const GET_VIDEOS_VARIANT_LANGUAGES = gql`
  query GetVideosVariantLanguages($ids: [ID!]) {
    videos(where: { ids: $ids }) {
      id
      variant {
        id
      }
      variants {
        language {
          id
        }
      }
    }
  }
`

export function useCommonVideoVariantLanguages(
  journey?: AdminJourney | JourneyFields
) {
  const { data: journeyInternalVideos, loading: journeyVideosLoading } =
    useQuery<GetJourneyInternalVideos, GetJourneyInternalVideosVariables>(
      GET_JOURNEY_INTERNAL_VIDEOS,
      {
        variables: {
          journeyId: journey?.id ?? ''
        },
        skip: journey == null
      }
    )

  const videoIds = useMemo(() => {
    if (!journeyInternalVideos) return []

    return journeyInternalVideos.journey.blocks?.reduce<string[]>(
      (videoIds, block) => {
        if (block.__typename === 'VideoBlock' && block.videoId != null) {
          videoIds.push(block.videoId)
        }
        return videoIds
      },
      []
    )
  }, [journeyInternalVideos])

  const { data: videosVariantLanguages, loading: variantLanguagesLoading } =
    useQuery<GetVideosVariantLanguages, GetVideosVariantLanguagesVariables>(
      GET_VIDEOS_VARIANT_LANGUAGES,
      {
        variables: {
          ids: videoIds
        },
        skip: videoIds == null || videoIds.length === 0 || !journey?.id
      }
    )

  const commonLanguages = useMemo(() => {
    if (!videosVariantLanguages?.videos) return []

    return videosVariantLanguages.videos.reduce<string[]>(
      (commonLanguageIds, video, index) => {
        const languageIds = video.variants.map((variant) => variant.language.id)
        if (index === 0) return languageIds
        return commonLanguageIds.filter((id) => languageIds.includes(id))
      },
      []
    )
  }, [videosVariantLanguages])

  const intersection = commonLanguages.filter((id) =>
    SUPPORTED_LANGUAGE_IDS.includes(
      id as (typeof SUPPORTED_LANGUAGE_IDS)[number]
    )
  )

  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    variables: {
      languageId: '529',
      where: {
        ids: [...intersection]
      }
    },
    skip: intersection.length === 0
  })

  const loading =
    journeyVideosLoading || variantLanguagesLoading || languagesLoading

  return { commonLanguages: languagesData, loading }
}
