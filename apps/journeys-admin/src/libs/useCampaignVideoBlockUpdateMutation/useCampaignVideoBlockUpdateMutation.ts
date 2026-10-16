import { ApolloLink, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import {
  CampaignVideoBlockUpdate,
  CampaignVideoBlockUpdateVariables
} from '../../../__generated__/CampaignVideoBlockUpdate'
import { CampaignVideoBlock } from '../useCampaignVideoBlockCreateMutation'

export const CAMPAIGN_VIDEO_BLOCK_UPDATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignVideoBlockUpdate(
    $id: ID!
    $input: CampaignVideoBlockUpdateInput!
    $languageId: ID
  ) {
    campaignVideoBlockUpdate(id: $id, input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

/** A Campaign Video's two overrides; null falls back to the source text. */
export interface CampaignVideoTextInput {
  title?: string | null
  description?: string | null
}

export type CampaignVideoTextMutate = (
  block: CampaignVideoBlock,
  input: CampaignVideoTextInput
) => Promise<ApolloLink.Result<CampaignVideoBlockUpdate>>

/**
 * Write a Campaign Video's title or description override through
 * `campaignVideoBlockUpdate`, shown optimistically as the block with the
 * input applied (the server fills a cleared YouTube or Mux override back
 * from the source).
 */
export function useCampaignVideoBlockUpdateMutation(): CampaignVideoTextMutate {
  const client = useApolloClient()
  return useCallback(
    async (block, input) =>
      await client.mutate<
        CampaignVideoBlockUpdate,
        CampaignVideoBlockUpdateVariables
      >({
        mutation: CAMPAIGN_VIDEO_BLOCK_UPDATE,
        variables: { id: block.id, input },
        optimisticResponse: {
          campaignVideoBlockUpdate: { ...block, ...input }
        }
      }),
    [client]
  )
}
