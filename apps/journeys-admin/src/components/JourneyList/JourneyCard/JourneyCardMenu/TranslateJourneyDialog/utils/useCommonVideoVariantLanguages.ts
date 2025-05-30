import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'

import { GetAdminJourneys_journeys as AdminJourney } from '../../../../../../../__generated__/GetAdminJourneys'
import {
  GetJourneyInternalVideos,
  GetJourneyInternalVideosVariables
} from '../../../../../../../__generated__/GetJourneyInternalVideos'
import { JourneyFields } from '../../../../../../../__generated__/JourneyFields'

const GET_JOURNEY_INTERNAL_VIDEOS = gql`
  query GetJourneyInternalVideos($journeyId: ID!) {
    journey(id: $journeyId, idType: databaseId) {
      id
      blocks {
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

const GET_VIDEOS_VARIANT_LANGUAGES = gql`
  query GetVideosVariantLanguages($ids: [ID!]) {
    videos(where: { ids: $ids }) {
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
  // First query - gets journey internal videos
  const { data: journeyInternalVideos, loading: journeyVideosLoading } =
    useQuery<GetJourneyInternalVideos, GetJourneyInternalVideosVariables>(
      GET_JOURNEY_INTERNAL_VIDEOS,
      {
        variables: {
          journeyId: journey?.id ?? ''
        },
        skip: !journey?.id
      }
    )

  const videoIds = useMemo(() => {
    if (!journeyInternalVideos) return []

    const ids = journeyInternalVideos.journey.blocks
      ?.filter((block) => block.__typename === 'VideoBlock')
      .map((block) => block.videoId)

    return Array.from(new Set(ids))
  }, [journeyInternalVideos])

  console.log('videoIds', videoIds)

  // Second query - depends on the result of the first
  const { data: videosVariantLanguages, loading: variantLanguagesLoading } =
    useQuery(GET_VIDEOS_VARIANT_LANGUAGES, {
      variables: {
        ids: videoIds
      },
      skip: videoIds.length === 0 || !journey?.id
    })

  const commonLanguages = useMemo(() => {
    if (!videosVariantLanguages?.videos) return []

    return (
      console.log('videosVariantLanguages', videosVariantLanguages),
      videosVariantLanguages.videos.reduce((common, video, index) => {
        console.log('HERE')
        const languageIds = video.variants.map((variant) => variant.language.id)
        console.log('index', index, 'languageIds', languageIds)
        // If it's the first video, use its language IDs as the initial set
        if (index === 0) return languageIds
        // Otherwise, return only the IDs that exist in both the current video and the accumulated common set
        return common.filter((id) => languageIds.includes(id))
      }, [] as string[]) ?? []
    )
  }, [videosVariantLanguages])

  console.log('commonLanguages', commonLanguages)

  const loading = journeyVideosLoading || variantLanguagesLoading

  return { commonLanguages, loading }
}
