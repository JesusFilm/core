import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignUpdate,
  CampaignUpdateVariables
} from '../../../__generated__/CampaignUpdate'

export const CAMPAIGN_UPDATE = gql`
  mutation CampaignUpdate($id: ID!, $input: CampaignUpdateInput!) {
    campaignUpdate(id: $id, input: $input) {
      id
      title
      slug
    }
  }
`

export function useCampaignUpdateMutation(
  options?: useMutation.Options<CampaignUpdate, CampaignUpdateVariables>
): useMutation.ResultTuple<CampaignUpdate, CampaignUpdateVariables> {
  return useMutation<CampaignUpdate, CampaignUpdateVariables>(
    CAMPAIGN_UPDATE,
    options
  )
}
