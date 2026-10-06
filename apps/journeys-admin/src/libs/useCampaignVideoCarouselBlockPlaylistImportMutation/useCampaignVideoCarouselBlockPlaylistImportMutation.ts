import { ApolloLink, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import {
  CampaignVideoCarouselBlockPlaylistImport,
  CampaignVideoCarouselBlockPlaylistImportVariables
} from '../../../__generated__/CampaignVideoCarouselBlockPlaylistImport'
import { campaignBlocksAdd } from '../campaignBlockCache'

export const CAMPAIGN_VIDEO_CAROUSEL_BLOCK_PLAYLIST_IMPORT = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignVideoCarouselBlockPlaylistImport(
    $id: ID!
    $url: String!
    $languageId: ID
  ) {
    campaignVideoCarouselBlockPlaylistImport(id: $id, url: $url) {
      ...CampaignPublicBlockFields
    }
  }
`

export type ImportCarouselPlaylist = (
  carouselId: string,
  url: string
) => Promise<ApolloLink.Result<CampaignVideoCarouselBlockPlaylistImport>>

/**
 * Import the first 12 videos of a YouTube playlist into a Video Carousel
 * as explicit items through `campaignVideoCarouselBlockPlaylistImport`; the
 * created items join the campaign's cached block list when the server
 * answers (their ids are the server's).
 */
export function useCampaignVideoCarouselBlockPlaylistImportMutation(
  campaignId: string
): ImportCarouselPlaylist {
  const client = useApolloClient()
  return useCallback(
    async (carouselId, url) =>
      await client.mutate<
        CampaignVideoCarouselBlockPlaylistImport,
        CampaignVideoCarouselBlockPlaylistImportVariables
      >({
        mutation: CAMPAIGN_VIDEO_CAROUSEL_BLOCK_PLAYLIST_IMPORT,
        variables: { id: carouselId, url },
        update(cache, { data }) {
          const items = data?.campaignVideoCarouselBlockPlaylistImport
          if (items == null) return
          campaignBlocksAdd(cache, campaignId, items)
        }
      }),
    [client, campaignId]
  )
}
