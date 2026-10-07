import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import {
  CampaignBlockDuplicate,
  CampaignBlockDuplicateVariables
} from '../../../__generated__/CampaignBlockDuplicate'
import { campaignBlockRestoreUpdate } from '../campaignBlockCache'
import { CAMPAIGN_BLOCK_TRANSLATION_FIELDS } from '../useCampaignQuery/campaignFields'

export const CAMPAIGN_BLOCK_DUPLICATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignBlockDuplicate(
    $id: ID!
    $idMap: [CampaignBlockDuplicateIdMapInput!]
  ) {
    campaignBlockDuplicate(id: $id, idMap: $idMap) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

/**
 * Duplicate a block: the API returns the renumbered siblings with the copy
 * among them, then the copied descendants. All of them go into the
 * campaign's cached block list, exactly as a restore does.
 */
export function useCampaignBlockDuplicateMutation(
  campaignId: string,
  options?: useMutation.Options<
    CampaignBlockDuplicate,
    CampaignBlockDuplicateVariables
  >
): useMutation.ResultTuple<
  CampaignBlockDuplicate,
  CampaignBlockDuplicateVariables
> {
  return useMutation<CampaignBlockDuplicate, CampaignBlockDuplicateVariables>(
    CAMPAIGN_BLOCK_DUPLICATE,
    {
      update(cache, { data }) {
        campaignBlockRestoreUpdate(
          cache,
          campaignId,
          data?.campaignBlockDuplicate
        )
      },
      ...options
    }
  )
}
