import { ApolloLink, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import {
  CampaignRegionSwitcherBlockUpdateVariant,
  CampaignRegionSwitcherBlockUpdateVariantVariables
} from '../../../__generated__/CampaignRegionSwitcherBlockUpdateVariant'
import { GetCampaign_campaign_blocks_CampaignRegionSwitcherBlock as CampaignRegionSwitcherBlock } from '../../../__generated__/GetCampaign'
import { CampaignSwitcherVariant } from '../../../__generated__/globalTypes'

export const CAMPAIGN_REGION_SWITCHER_BLOCK_UPDATE_VARIANT = gql`
  mutation CampaignRegionSwitcherBlockUpdateVariant(
    $id: ID!
    $input: CampaignRegionSwitcherBlockUpdateInput!
  ) {
    campaignRegionSwitcherBlockUpdate(id: $id, input: $input) {
      id
      switcherVariant: variant
    }
  }
`

/** How a Region Switcher lists the regions. */
export interface CampaignRegionSwitcherVariantInput {
  variant: CampaignSwitcherVariant
}

export type CampaignRegionSwitcherVariantMutate = (
  block: Pick<CampaignRegionSwitcherBlock, 'id'>,
  input: CampaignRegionSwitcherVariantInput
) => Promise<ApolloLink.Result<CampaignRegionSwitcherBlockUpdateVariant>>

/**
 * Write a Region Switcher's variant through
 * `campaignRegionSwitcherBlockUpdate`, shown optimistically.
 */
export function useCampaignRegionSwitcherBlockVariantMutation(): CampaignRegionSwitcherVariantMutate {
  const client = useApolloClient()
  return useCallback(
    async (block, input) =>
      await client.mutate<
        CampaignRegionSwitcherBlockUpdateVariant,
        CampaignRegionSwitcherBlockUpdateVariantVariables
      >({
        mutation: CAMPAIGN_REGION_SWITCHER_BLOCK_UPDATE_VARIANT,
        variables: { id: block.id, input },
        optimisticResponse: {
          campaignRegionSwitcherBlockUpdate: {
            __typename: 'CampaignRegionSwitcherBlock',
            id: block.id,
            switcherVariant: input.variant
          }
        }
      }),
    [client]
  )
}
