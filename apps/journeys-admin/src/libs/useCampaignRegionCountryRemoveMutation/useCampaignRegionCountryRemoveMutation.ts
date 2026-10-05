import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignRegionCountryRemove,
  CampaignRegionCountryRemoveVariables
} from '../../../__generated__/CampaignRegionCountryRemove'
import { campaignRegionCountriesRemove } from '../campaignRegionCache'

export const CAMPAIGN_REGION_COUNTRY_REMOVE = gql`
  mutation CampaignRegionCountryRemove($id: ID!) {
    campaignRegionCountryRemove(id: $id) {
      id
      regionId
    }
  }
`

/** Remove a country chip and drop it from the region's cached chip list. */
export function useCampaignRegionCountryRemoveMutation(
  options?: useMutation.Options<
    CampaignRegionCountryRemove,
    CampaignRegionCountryRemoveVariables
  >
): useMutation.ResultTuple<
  CampaignRegionCountryRemove,
  CampaignRegionCountryRemoveVariables
> {
  return useMutation<
    CampaignRegionCountryRemove,
    CampaignRegionCountryRemoveVariables
  >(CAMPAIGN_REGION_COUNTRY_REMOVE, {
    update(cache, { data }) {
      const country = data?.campaignRegionCountryRemove
      if (country == null) return
      campaignRegionCountriesRemove(cache, country.regionId, country.id)
    },
    ...options
  })
}
