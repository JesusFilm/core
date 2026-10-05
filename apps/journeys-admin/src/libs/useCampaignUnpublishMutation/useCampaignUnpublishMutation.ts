import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignUnpublish,
  CampaignUnpublishVariables
} from '../../../__generated__/CampaignUnpublish'

export const CAMPAIGN_UNPUBLISH = gql`
  mutation CampaignUnpublish($id: ID!) {
    campaignUnpublish(id: $id) {
      id
      status
      publishedAt
    }
  }
`

export function useCampaignUnpublishMutation(
  options?: useMutation.Options<CampaignUnpublish, CampaignUnpublishVariables>
): useMutation.ResultTuple<CampaignUnpublish, CampaignUnpublishVariables> {
  return useMutation<CampaignUnpublish, CampaignUnpublishVariables>(
    CAMPAIGN_UNPUBLISH,
    options
  )
}
