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

/**
 * Resolve a Watch variant slug (`<video>/<language>`) through the gateway's
 * `video(id, idType: slug)`, for the media paste field to show what a pasted
 * Watch address names before it is kept. Skipped while there is no slug.
 */
export function useCampaignWatchVideoQuery(
  slug: string | undefined
): useQuery.Result<
  GetCampaignWatchVideo,
  GetCampaignWatchVideoVariables,
  'empty' | 'complete' | 'streaming',
  Partial<GetCampaignWatchVideoVariables>
> {
  return useQuery<GetCampaignWatchVideo, GetCampaignWatchVideoVariables>(
    GET_CAMPAIGN_WATCH_VIDEO,
    slug == null ? skipToken : { variables: { id: slug } }
  )
}
