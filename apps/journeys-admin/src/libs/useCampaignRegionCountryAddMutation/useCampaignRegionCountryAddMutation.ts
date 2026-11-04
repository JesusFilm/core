import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignRegionCountryAdd,
  CampaignRegionCountryAddVariables
} from '../../../__generated__/CampaignRegionCountryAdd'
import { campaignRegionCountriesAdd } from '../campaignRegionCache'

export const CAMPAIGN_REGION_COUNTRY_ADD = gql`
  mutation CampaignRegionCountryAdd($regionId: ID!, $countryId: ID!) {
    campaignRegionCountryAdd(regionId: $regionId, countryId: $countryId) {
      __typename
      id
      regionId
      countryId
      order
      country {
        id
        flagPngSrc
        name(primary: true) {
          value
        }
      }
    }
  }
`

/** Add a country chip and append it to the region's cached chip list. */
export function useCampaignRegionCountryAddMutation(
  options?: useMutation.Options<
    CampaignRegionCountryAdd,
    CampaignRegionCountryAddVariables
  >
): useMutation.ResultTuple<
  CampaignRegionCountryAdd,
  CampaignRegionCountryAddVariables
> {
  return useMutation<
    CampaignRegionCountryAdd,
    CampaignRegionCountryAddVariables
  >(CAMPAIGN_REGION_COUNTRY_ADD, {
    update(cache, { data }) {
      const country = data?.campaignRegionCountryAdd
      if (country == null) return
      campaignRegionCountriesAdd(cache, country.regionId, country)
    },
    ...options
  })
}
