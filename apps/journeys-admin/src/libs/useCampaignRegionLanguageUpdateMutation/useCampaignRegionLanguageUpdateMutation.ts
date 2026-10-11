import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignRegionLanguageUpdate,
  CampaignRegionLanguageUpdateVariables
} from '../../../__generated__/CampaignRegionLanguageUpdate'
import { CAMPAIGN_REGION_LANGUAGE_FIELDS } from '../useCampaignQuery/campaignFields'

export const CAMPAIGN_REGION_LANGUAGE_UPDATE = gql`
  ${CAMPAIGN_REGION_LANGUAGE_FIELDS}
  mutation CampaignRegionLanguageUpdate(
    $id: ID!
    $input: CampaignRegionLanguageUpdateInput!
  ) {
    campaignRegionLanguageUpdate(id: $id, input: $input) {
      ...CampaignRegionLanguageFields
    }
  }
`

/** Link, swap, unlink or re-describe a Share Language's journey; the row is normalised from the result. */
export function useCampaignRegionLanguageUpdateMutation(
  options?: useMutation.Options<
    CampaignRegionLanguageUpdate,
    CampaignRegionLanguageUpdateVariables
  >
): useMutation.ResultTuple<
  CampaignRegionLanguageUpdate,
  CampaignRegionLanguageUpdateVariables
> {
  return useMutation<
    CampaignRegionLanguageUpdate,
    CampaignRegionLanguageUpdateVariables
  >(CAMPAIGN_REGION_LANGUAGE_UPDATE, options)
}
