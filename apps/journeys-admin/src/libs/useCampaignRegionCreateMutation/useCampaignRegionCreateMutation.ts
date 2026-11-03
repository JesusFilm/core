import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignRegionCreate,
  CampaignRegionCreateVariables
} from '../../../__generated__/CampaignRegionCreate'
import { campaignRegionsAdd } from '../campaignRegionCache'
import { CAMPAIGN_REGION_FIELDS } from '../useCampaignQuery/campaignFields'

export const CAMPAIGN_REGION_CREATE = gql`
  ${CAMPAIGN_REGION_FIELDS}
  mutation CampaignRegionCreate($campaignId: ID!, $id: ID) {
    campaignRegionCreate(campaignId: $campaignId, id: $id) {
      ...CampaignRegionFields
    }
  }
`

/** Add a region and append it to the campaign's cached region list. */
export function useCampaignRegionCreateMutation(
  campaignId: string,
  options?: useMutation.Options<
    CampaignRegionCreate,
    CampaignRegionCreateVariables
  >
): useMutation.ResultTuple<
  CampaignRegionCreate,
  CampaignRegionCreateVariables
> {
  return useMutation<CampaignRegionCreate, CampaignRegionCreateVariables>(
    CAMPAIGN_REGION_CREATE,
    {
      update(cache, { data }) {
        if (data?.campaignRegionCreate == null) return
        campaignRegionsAdd(cache, campaignId, data.campaignRegionCreate)
      },
      ...options
    }
  )
}
