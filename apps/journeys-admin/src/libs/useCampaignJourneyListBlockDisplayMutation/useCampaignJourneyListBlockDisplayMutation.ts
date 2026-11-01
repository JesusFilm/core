import { ApolloLink, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import {
  CampaignJourneyListBlockUpdateDisplay,
  CampaignJourneyListBlockUpdateDisplayVariables
} from '../../../__generated__/CampaignJourneyListBlockUpdateDisplay'
import { GetCampaign_campaign_blocks_CampaignJourneyListBlock as CampaignJourneyListBlock } from '../../../__generated__/GetCampaign'
import { CampaignJourneyListDisplay } from '../../../__generated__/globalTypes'

export const CAMPAIGN_JOURNEY_LIST_BLOCK_UPDATE_DISPLAY = gql`
  mutation CampaignJourneyListBlockUpdateDisplay(
    $id: ID!
    $input: CampaignJourneyListBlockUpdateInput!
  ) {
    campaignJourneyListBlockUpdate(id: $id, input: $input) {
      id
      display
    }
  }
`

/** How a Journey List renders its items. */
export interface CampaignJourneyListDisplayInput {
  display: CampaignJourneyListDisplay
}

export type CampaignJourneyListDisplayMutate = (
  block: Pick<CampaignJourneyListBlock, 'id'>,
  input: CampaignJourneyListDisplayInput
) => Promise<ApolloLink.Result<CampaignJourneyListBlockUpdateDisplay>>

/**
 * Write a Journey List's display through `campaignJourneyListBlockUpdate`,
 * shown optimistically.
 */
export function useCampaignJourneyListBlockDisplayMutation(): CampaignJourneyListDisplayMutate {
  const client = useApolloClient()
  return useCallback(
    async (block, input) =>
      await client.mutate<
        CampaignJourneyListBlockUpdateDisplay,
        CampaignJourneyListBlockUpdateDisplayVariables
      >({
        mutation: CAMPAIGN_JOURNEY_LIST_BLOCK_UPDATE_DISPLAY,
        variables: { id: block.id, input },
        optimisticResponse: {
          campaignJourneyListBlockUpdate: {
            __typename: 'CampaignJourneyListBlock',
            id: block.id,
            display: input.display
          }
        }
      }),
    [client]
  )
}
