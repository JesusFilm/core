import { ApolloLink, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import {
  CampaignVideoCarouselBlockUpdateVideo,
  CampaignVideoCarouselBlockUpdateVideoVariables
} from '../../../__generated__/CampaignVideoCarouselBlockUpdateVideo'
import { GetCampaign_campaign_blocks_CampaignVideoCarouselBlock } from '../../../__generated__/GetCampaign'

export type CampaignVideoCarouselBlock =
  GetCampaign_campaign_blocks_CampaignVideoCarouselBlock

export const CAMPAIGN_VIDEO_CAROUSEL_BLOCK_UPDATE_VIDEO = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignVideoCarouselBlockUpdateVideo(
    $id: ID!
    $input: CampaignVideoCarouselBlockUpdateInput!
    $languageId: ID
  ) {
    campaignVideoCarouselBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

/**
 * The carousel's mode: a pasted Watch `url` (the server resolves it to the
 * Video), a known `videoId` with its language (what undo writes back), or
 * `videoId: null` for explicit mode.
 */
export interface CampaignCarouselVideoInput {
  url?: string
  videoId?: string | null
  videoVariantLanguageId?: string | null
}

export type CampaignCarouselVideoMutate = (
  block: CampaignVideoCarouselBlock,
  input: CampaignCarouselVideoInput
) => Promise<ApolloLink.Result<CampaignVideoCarouselBlockUpdateVideo>>

/**
 * Write a Video Carousel's Watch expansion through
 * `campaignVideoCarouselBlockUpdate`, reading back the whole block so the
 * gateway's `video { children }` lands in the cache with it. Switching to
 * explicit mode shows at once; a Watch link waits for the server, which
 * resolves it.
 */
export function useCampaignVideoCarouselBlockUpdateMutation(): CampaignCarouselVideoMutate {
  const client = useApolloClient()
  return useCallback(
    async (block, input) =>
      await client.mutate<
        CampaignVideoCarouselBlockUpdateVideo,
        CampaignVideoCarouselBlockUpdateVideoVariables
      >({
        mutation: CAMPAIGN_VIDEO_CAROUSEL_BLOCK_UPDATE_VIDEO,
        variables: { id: block.id, input },
        optimisticResponse:
          input.videoId === null
            ? {
                campaignVideoCarouselBlockUpdate: {
                  ...block,
                  videoId: null,
                  videoVariantLanguageId: null,
                  video: null
                }
              }
            : undefined
      }),
    [client]
  )
}
