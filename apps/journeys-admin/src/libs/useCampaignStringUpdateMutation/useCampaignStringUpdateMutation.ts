import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignStringUpdate,
  CampaignStringUpdateVariables
} from '../../../__generated__/CampaignStringUpdate'

/** Write the default-language wording of one Campaign String by key. */
export const CAMPAIGN_STRING_UPDATE = gql`
  mutation CampaignStringUpdate(
    $campaignId: ID!
    $key: CampaignStringKey!
    $value: String!
  ) {
    campaignStringUpdate(campaignId: $campaignId, key: $key, value: $value) {
      id
      key
      value
    }
  }
`

export function useCampaignStringUpdateMutation(
  options?: useMutation.Options<
    CampaignStringUpdate,
    CampaignStringUpdateVariables
  >
): useMutation.ResultTuple<
  CampaignStringUpdate,
  CampaignStringUpdateVariables
> {
  return useMutation<CampaignStringUpdate, CampaignStringUpdateVariables>(
    CAMPAIGN_STRING_UPDATE,
    options
  )
}
