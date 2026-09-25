import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignUnpublish,
  CampaignUnpublishVariables
} from '../../../__generated__/CampaignUnpublish'
import { CAMPAIGN_FIELDS } from '../campaignFields'

export const CAMPAIGN_UNPUBLISH = gql`
  ${CAMPAIGN_FIELDS}
  mutation CampaignUnpublish($id: ID!) {
    campaignUnpublish(id: $id) {
      ...CampaignFields
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
