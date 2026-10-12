import { ApolloLink, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import {
  CampaignFeaturedMediaBlockUpdate,
  CampaignFeaturedMediaBlockUpdateVariables
} from '../../../__generated__/CampaignFeaturedMediaBlockUpdate'
import { GetCampaign_campaign_blocks_CampaignFeaturedMediaBlock as CampaignFeaturedMediaBlock } from '../../../__generated__/GetCampaign'
import { CampaignMediaSide } from '../../../__generated__/globalTypes'

export const CAMPAIGN_FEATURED_MEDIA_BLOCK_UPDATE = gql`
  mutation CampaignFeaturedMediaBlockUpdate(
    $id: ID!
    $input: CampaignFeaturedMediaBlockUpdateInput!
  ) {
    campaignFeaturedMediaBlockUpdate(id: $id, input: $input) {
      id
      mediaSide
      mediaBlockId
    }
  }
`

/** The Featured Media layout fields: which side the media sits on, and what fills the slot. */
export interface CampaignFeaturedMediaInput {
  mediaSide?: CampaignMediaSide
  mediaBlockId?: string | null
}

export type CampaignFeaturedMediaMutate = (
  block: Pick<CampaignFeaturedMediaBlock, 'id' | 'mediaSide' | 'mediaBlockId'>,
  input: CampaignFeaturedMediaInput
) => Promise<ApolloLink.Result<CampaignFeaturedMediaBlockUpdate>>

/**
 * Write a Featured Media section's media side or Media Slot through
 * `campaignFeaturedMediaBlockUpdate`, shown optimistically as the block with
 * the input applied.
 */
export function useCampaignFeaturedMediaBlockUpdateMutation(): CampaignFeaturedMediaMutate {
  const client = useApolloClient()
  return useCallback(
    async (block, input) =>
      await client.mutate<
        CampaignFeaturedMediaBlockUpdate,
        CampaignFeaturedMediaBlockUpdateVariables
      >({
        mutation: CAMPAIGN_FEATURED_MEDIA_BLOCK_UPDATE,
        variables: { id: block.id, input },
        optimisticResponse: {
          campaignFeaturedMediaBlockUpdate: {
            __typename: 'CampaignFeaturedMediaBlock',
            id: block.id,
            mediaSide: input.mediaSide ?? block.mediaSide,
            mediaBlockId:
              input.mediaBlockId !== undefined
                ? input.mediaBlockId
                : block.mediaBlockId
          }
        }
      }),
    [client]
  )
}
