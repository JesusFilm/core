import { ApolloLink, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import {
  CampaignHeaderBlockUpdateLogo,
  CampaignHeaderBlockUpdateLogoVariables
} from '../../../__generated__/CampaignHeaderBlockUpdateLogo'
import { GetCampaign_campaign_blocks_CampaignHeaderBlock as CampaignHeaderBlock } from '../../../__generated__/GetCampaign'

export const CAMPAIGN_HEADER_BLOCK_UPDATE_LOGO = gql`
  mutation CampaignHeaderBlockUpdateLogo(
    $id: ID!
    $input: CampaignHeaderBlockUpdateInput!
  ) {
    campaignHeaderBlockUpdate(id: $id, input: $input) {
      id
      logoBlockId
    }
  }
`

export interface CampaignHeaderLogoInput {
  logoBlockId: string | null
}

export type CampaignHeaderLogoMutate = (
  block: Pick<CampaignHeaderBlock, 'id'>,
  input: CampaignHeaderLogoInput
) => Promise<ApolloLink.Result<CampaignHeaderBlockUpdateLogo>>

/**
 * Point the header's logo slot at an owned image, or clear it (null) so the
 * Brand Mark falls back to the campaign title, shown optimistically.
 */
export function useCampaignHeaderLogoMutation(): CampaignHeaderLogoMutate {
  const client = useApolloClient()
  return useCallback(
    async (block, input) =>
      await client.mutate<
        CampaignHeaderBlockUpdateLogo,
        CampaignHeaderBlockUpdateLogoVariables
      >({
        mutation: CAMPAIGN_HEADER_BLOCK_UPDATE_LOGO,
        variables: { id: block.id, input },
        optimisticResponse: {
          campaignHeaderBlockUpdate: {
            __typename: 'CampaignHeaderBlock',
            id: block.id,
            logoBlockId: input.logoBlockId
          }
        }
      }),
    [client]
  )
}
