import { gql } from '@apollo/client'
import { skipToken, useQuery } from '@apollo/client/react'

import {
  GetCampaignWatchVideo,
  GetCampaignWatchVideoVariables
} from '../../../__generated__/GetCampaignWatchVideo'

export const GET_CAMPAIGN_WATCH_VIDEO = gql`
  query GetCampaignWatchVideo($id: ID!) {
    video(id: $id, idType: slug) {
      id
      label
      childrenCount
      title(primary: true) {
        value
      }
      description(primary: true) {
        value
      }
      images(aspectRatio: banner) {
        mobileCinematicHigh
      }
      variant {
        id
        duration
      }
    }
  }
`

type WatchVideoResult = useQuery.Result<
  GetCampaignWatchVideo,
  GetCampaignWatchVideoVariables,
  'empty' | 'complete' | 'streaming',
  Partial<GetCampaignWatchVideoVariables>
>

/**
 * Resolve a Watch address's candidate variant slugs (`<video>/<language>`,
 * in order) through the gateway's `video(id, idType: slug)`, for the media
 * paste field to show what a pasted Watch address names before it is kept.
 * The first candidate is tried, and when it resolves to nothing the next
 * one; the result is the last query run. Skipped while there are no slugs.
 */
export function useCampaignWatchVideoQuery(
  slugs: readonly string[] | undefined
): WatchVideoResult {
  const first = useQuery<GetCampaignWatchVideo, GetCampaignWatchVideoVariables>(
    GET_CAMPAIGN_WATCH_VIDEO,
    slugs?.[0] == null ? skipToken : { variables: { id: slugs[0] } }
  )
  const firstSettled =
    !first.loading && (first.data !== undefined || first.error != null)
  const firstMissed = firstSettled && first.data?.video == null
  const fallback = firstMissed ? slugs?.[1] : undefined
  const second = useQuery<
    GetCampaignWatchVideo,
    GetCampaignWatchVideoVariables
  >(
    GET_CAMPAIGN_WATCH_VIDEO,
    fallback == null ? skipToken : { variables: { id: fallback } }
  )
  return fallback == null ? first : second
}
