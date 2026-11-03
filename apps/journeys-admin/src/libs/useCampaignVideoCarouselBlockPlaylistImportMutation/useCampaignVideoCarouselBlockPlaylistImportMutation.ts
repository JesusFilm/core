import { ApolloClient, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { useCallback } from 'react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import {
  CampaignVideoCarouselBlockPlaylistImport,
  CampaignVideoCarouselBlockPlaylistImportVariables
} from '../../../__generated__/CampaignVideoCarouselBlockPlaylistImport'
import { campaignBlocksAdd } from '../campaignBlockCache'
import { CAMPAIGN_BLOCK_TRANSLATION_FIELDS } from '../useCampaignQuery'

export const CAMPAIGN_VIDEO_CAROUSEL_BLOCK_PLAYLIST_IMPORT = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignVideoCarouselBlockPlaylistImport(
    $id: ID!
    $url: String!
    $languageId: ID
  ) {
    campaignVideoCarouselBlockPlaylistImport(id: $id, url: $url) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

export type ImportCarouselPlaylist = (
  carouselId: string,
  url: string
) => Promise<
  ApolloClient.MutateResult<CampaignVideoCarouselBlockPlaylistImport>
>

/**
 * Import the first 12 videos of a YouTube playlist into a Video Carousel
 * as explicit items through `campaignVideoCarouselBlockPlaylistImport`; the
 * created items join the campaign's cached block list when the server
 * answers (their ids are the server's). The import can take seconds, so it
 * skips the app-wide mutation queue rather than hold every other save behind
 * it; the Campaign Command queue still orders it against undo and redo.
 */
export function useCampaignVideoCarouselBlockPlaylistImportMutation(
  campaignId: string
): ImportCarouselPlaylist {
  const [importPlaylist] = useMutation<
    CampaignVideoCarouselBlockPlaylistImport,
    CampaignVideoCarouselBlockPlaylistImportVariables
  >(CAMPAIGN_VIDEO_CAROUSEL_BLOCK_PLAYLIST_IMPORT)
  return useCallback(
    async (carouselId, url) =>
      await importPlaylist({
        variables: { id: carouselId, url },
        context: { skipQueue: true },
        update(cache, { data }) {
          const items = data?.campaignVideoCarouselBlockPlaylistImport
          if (items == null) return
          campaignBlocksAdd(cache, campaignId, items)
        }
      }),
    [importPlaylist, campaignId]
  )
}
