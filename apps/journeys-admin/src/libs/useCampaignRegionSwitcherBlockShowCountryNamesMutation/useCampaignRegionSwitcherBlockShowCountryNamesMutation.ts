import { ApolloLink, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import {
  CampaignRegionSwitcherBlockUpdateShowCountryNames,
  CampaignRegionSwitcherBlockUpdateShowCountryNamesVariables
} from '../../../__generated__/CampaignRegionSwitcherBlockUpdateShowCountryNames'
import { GetCampaign_campaign_blocks_CampaignRegionSwitcherBlock as CampaignRegionSwitcherBlock } from '../../../__generated__/GetCampaign'

export const CAMPAIGN_REGION_SWITCHER_BLOCK_UPDATE_SHOW_COUNTRY_NAMES = gql`
  mutation CampaignRegionSwitcherBlockUpdateShowCountryNames(
    $id: ID!
    $input: CampaignRegionSwitcherBlockUpdateInput!
  ) {
    campaignRegionSwitcherBlockUpdate(id: $id, input: $input) {
      id
      showCountryNames
    }
  }
`

/** Whether the Region Switcher's country chips show their names beside the flags. */
export interface CampaignRegionSwitcherShowCountryNamesInput {
  showCountryNames: boolean
}

export type CampaignRegionSwitcherShowCountryNamesMutate = (
  block: Pick<CampaignRegionSwitcherBlock, 'id'>,
  input: CampaignRegionSwitcherShowCountryNamesInput
) => Promise<
  ApolloLink.Result<CampaignRegionSwitcherBlockUpdateShowCountryNames>
>

/**
 * Show or hide the country names of one Region Switcher section through
 * `campaignRegionSwitcherBlockUpdate`, shown optimistically.
 */
export function useCampaignRegionSwitcherBlockShowCountryNamesMutation(): CampaignRegionSwitcherShowCountryNamesMutate {
  const client = useApolloClient()
  return useCallback(
    async (block, input) =>
      await client.mutate<
        CampaignRegionSwitcherBlockUpdateShowCountryNames,
        CampaignRegionSwitcherBlockUpdateShowCountryNamesVariables
      >({
        mutation: CAMPAIGN_REGION_SWITCHER_BLOCK_UPDATE_SHOW_COUNTRY_NAMES,
        variables: { id: block.id, input },
        optimisticResponse: {
          campaignRegionSwitcherBlockUpdate: {
            __typename: 'CampaignRegionSwitcherBlock',
            id: block.id,
            showCountryNames: input.showCountryNames
          }
        }
      }),
    [client]
  )
}
