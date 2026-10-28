import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignPublish,
  CampaignPublishVariables
} from '../../../__generated__/CampaignPublish'

export const CAMPAIGN_PUBLISH = gql`
  mutation CampaignPublish($id: ID!) {
    campaignPublish(id: $id) {
      id
      status
      publishedAt
    }
  }
`

export function useCampaignPublishMutation(
  options?: useMutation.Options<CampaignPublish, CampaignPublishVariables>
): useMutation.ResultTuple<CampaignPublish, CampaignPublishVariables> {
  return useMutation<CampaignPublish, CampaignPublishVariables>(
    CAMPAIGN_PUBLISH,
    options
  )
}
