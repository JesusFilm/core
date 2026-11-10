import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignLanguageAdd,
  CampaignLanguageAddVariables
} from '../../../__generated__/CampaignLanguageAdd'
import { CAMPAIGN_LANGUAGE_FIELDS } from '../useCampaignQuery'

/** Append a Page Language; the campaign's language list comes back in selector order. */
export const CAMPAIGN_LANGUAGE_ADD = gql`
  ${CAMPAIGN_LANGUAGE_FIELDS}
  mutation CampaignLanguageAdd($campaignId: ID!, $languageId: ID!) {
    campaignLanguageAdd(campaignId: $campaignId, languageId: $languageId) {
      id
      languages {
        ...CampaignLanguageFields
      }
    }
  }
`

export function useCampaignLanguageAddMutation(
  options?: useMutation.Options<
    CampaignLanguageAdd,
    CampaignLanguageAddVariables
  >
): useMutation.ResultTuple<CampaignLanguageAdd, CampaignLanguageAddVariables> {
  return useMutation<CampaignLanguageAdd, CampaignLanguageAddVariables>(
    CAMPAIGN_LANGUAGE_ADD,
    options
  )
}
