import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignRegionUpdate,
  CampaignRegionUpdateVariables
} from '../../../__generated__/CampaignRegionUpdate'

export const CAMPAIGN_REGION_UPDATE = gql`
  mutation CampaignRegionUpdate($id: ID!, $input: CampaignRegionUpdateInput!) {
    campaignRegionUpdate(id: $id, input: $input) {
      id
      name
      slug
      listed
    }
  }
`

export function useCampaignRegionUpdateMutation(
  options?: useMutation.Options<
    CampaignRegionUpdate,
    CampaignRegionUpdateVariables
  >
): useMutation.ResultTuple<
  CampaignRegionUpdate,
  CampaignRegionUpdateVariables
> {
  return useMutation<CampaignRegionUpdate, CampaignRegionUpdateVariables>(
    CAMPAIGN_REGION_UPDATE,
    options
  )
}
