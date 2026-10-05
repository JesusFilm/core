import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignRegionDelete,
  CampaignRegionDeleteVariables
} from '../../../__generated__/CampaignRegionDelete'
import { campaignRegionsRemove } from '../campaignRegionCache'

export const CAMPAIGN_REGION_DELETE = gql`
  mutation CampaignRegionDelete($id: ID!) {
    campaignRegionDelete(id: $id) {
      id
    }
  }
`

/** Hard-delete a region and drop it from the campaign's cached region list. */
export function useCampaignRegionDeleteMutation(
  campaignId: string,
  options?: useMutation.Options<
    CampaignRegionDelete,
    CampaignRegionDeleteVariables
  >
): useMutation.ResultTuple<
  CampaignRegionDelete,
  CampaignRegionDeleteVariables
> {
  return useMutation<CampaignRegionDelete, CampaignRegionDeleteVariables>(
    CAMPAIGN_REGION_DELETE,
    {
      update(cache, { data }) {
        if (data?.campaignRegionDelete == null) return
        campaignRegionsRemove(cache, campaignId, data.campaignRegionDelete.id)
      },
      ...options
    }
  )
}
