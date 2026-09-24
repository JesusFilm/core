import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignPublish,
  CampaignPublishVariables
} from '../../../__generated__/CampaignPublish'
import { CAMPAIGN_FIELDS } from '../campaignFields'

export const CAMPAIGN_PUBLISH = gql`
  ${CAMPAIGN_FIELDS}
  mutation CampaignPublish($id: ID!) {
    campaignPublish(id: $id) {
      ...CampaignFields
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
