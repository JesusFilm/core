import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignCreate,
  CampaignCreateVariables
} from '../../../__generated__/CampaignCreate'
import { CAMPAIGN_FIELDS } from '../campaignFields'

export const CAMPAIGN_CREATE = gql`
  ${CAMPAIGN_FIELDS}
  mutation CampaignCreate($input: CampaignCreateInput!) {
    campaignCreate(input: $input) {
      ...CampaignFields
    }
  }
`

export function useCampaignCreateMutation(
  options?: useMutation.Options<CampaignCreate, CampaignCreateVariables>
): useMutation.ResultTuple<CampaignCreate, CampaignCreateVariables> {
  return useMutation<CampaignCreate, CampaignCreateVariables>(CAMPAIGN_CREATE, {
    // The list is team-scoped; refetching by operation name keeps the
    // active team's list in sync without threading teamId through here.
    refetchQueries: ['GetCampaigns'],
    ...options
  })
}
