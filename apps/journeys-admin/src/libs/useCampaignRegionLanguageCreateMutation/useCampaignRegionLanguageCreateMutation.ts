import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignRegionLanguageCreate,
  CampaignRegionLanguageCreateVariables
} from '../../../__generated__/CampaignRegionLanguageCreate'
import { campaignRegionLanguagesAdd } from '../campaignRegionCache'
import { CAMPAIGN_REGION_LANGUAGE_FIELDS } from '../useCampaignQuery/campaignFields'

export const CAMPAIGN_REGION_LANGUAGE_CREATE = gql`
  ${CAMPAIGN_REGION_LANGUAGE_FIELDS}
  mutation CampaignRegionLanguageCreate($regionId: ID!, $languageId: ID!) {
    campaignRegionLanguageCreate(regionId: $regionId, languageId: $languageId) {
      ...CampaignRegionLanguageFields
    }
  }
`

/** Add a Share Language and append it to the region's cached language list. */
export function useCampaignRegionLanguageCreateMutation(
  options?: useMutation.Options<
    CampaignRegionLanguageCreate,
    CampaignRegionLanguageCreateVariables
  >
): useMutation.ResultTuple<
  CampaignRegionLanguageCreate,
  CampaignRegionLanguageCreateVariables
> {
  return useMutation<
    CampaignRegionLanguageCreate,
    CampaignRegionLanguageCreateVariables
  >(CAMPAIGN_REGION_LANGUAGE_CREATE, {
    update(cache, { data }) {
      const regionLanguage = data?.campaignRegionLanguageCreate
      if (regionLanguage == null) return
      campaignRegionLanguagesAdd(cache, regionLanguage.regionId, regionLanguage)
    },
    ...options
  })
}
