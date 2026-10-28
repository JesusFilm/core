import { ApolloLink, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import {
  CampaignHeroBlockUpdateMinHeight,
  CampaignHeroBlockUpdateMinHeightVariables
} from '../../../__generated__/CampaignHeroBlockUpdateMinHeight'
import { GetCampaign_campaign_blocks_CampaignHeroBlock as CampaignHeroBlock } from '../../../__generated__/GetCampaign'

export const CAMPAIGN_HERO_BLOCK_UPDATE_MIN_HEIGHT = gql`
  mutation CampaignHeroBlockUpdateMinHeight(
    $id: ID!
    $input: CampaignHeroBlockUpdateInput!
  ) {
    campaignHeroBlockUpdate(id: $id, input: $input) {
      id
      minHeight
    }
  }
`

/** The hero's minimum height as a percentage of the viewport height; null for content height. */
export interface CampaignHeroMinHeightInput {
  minHeight: number | null
}

export type CampaignHeroMinHeightMutate = (
  block: Pick<CampaignHeroBlock, 'id'>,
  input: CampaignHeroMinHeightInput
) => Promise<ApolloLink.Result<CampaignHeroBlockUpdateMinHeight>>

/**
 * Write the hero's minimum height through `campaignHeroBlockUpdate`, shown
 * optimistically so the canvas stretches as the slider settles.
 */
export function useCampaignHeroBlockMinHeightMutation(): CampaignHeroMinHeightMutate {
  const client = useApolloClient()
  return useCallback(
    async (block, input) =>
      await client.mutate<
        CampaignHeroBlockUpdateMinHeight,
        CampaignHeroBlockUpdateMinHeightVariables
      >({
        mutation: CAMPAIGN_HERO_BLOCK_UPDATE_MIN_HEIGHT,
        variables: { id: block.id, input },
        optimisticResponse: {
          campaignHeroBlockUpdate: {
            __typename: 'CampaignHeroBlock',
            id: block.id,
            minHeight: input.minHeight
          }
        }
      }),
    [client]
  )
}
