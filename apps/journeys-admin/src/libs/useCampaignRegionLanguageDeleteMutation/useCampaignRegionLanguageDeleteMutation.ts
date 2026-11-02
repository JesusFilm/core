import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignRegionLanguageDelete,
  CampaignRegionLanguageDeleteVariables
} from '../../../__generated__/CampaignRegionLanguageDelete'
import { campaignRegionLanguagesRemove } from '../campaignRegionCache'

export const CAMPAIGN_REGION_LANGUAGE_DELETE = gql`
  mutation CampaignRegionLanguageDelete($id: ID!) {
    campaignRegionLanguageDelete(id: $id) {
      __typename
      id
      regionId
    }
  }
`

/** Remove a Share Language and drop it from the region's cached language list. */
export function useCampaignRegionLanguageDeleteMutation(
  options?: useMutation.Options<
    CampaignRegionLanguageDelete,
    CampaignRegionLanguageDeleteVariables
  >
): useMutation.ResultTuple<
  CampaignRegionLanguageDelete,
  CampaignRegionLanguageDeleteVariables
> {
  return useMutation<
    CampaignRegionLanguageDelete,
    CampaignRegionLanguageDeleteVariables
  >(CAMPAIGN_REGION_LANGUAGE_DELETE, {
    update(cache, { data }) {
      const deleted = data?.campaignRegionLanguageDelete
      if (deleted == null) return
      campaignRegionLanguagesRemove(cache, deleted.regionId, deleted.id)
    },
    ...options
  })
}
