import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignLanguageRemove,
  CampaignLanguageRemoveVariables
} from '../../../__generated__/CampaignLanguageRemove'
import { CAMPAIGN_LANGUAGE_FIELDS } from '../useCampaignLanguageAddMutation'

/** Remove a Page Language; refused for the default or the last language (`CONFLICT`). */
export const CAMPAIGN_LANGUAGE_REMOVE = gql`
  ${CAMPAIGN_LANGUAGE_FIELDS}
  mutation CampaignLanguageRemove($campaignId: ID!, $languageId: ID!) {
    campaignLanguageRemove(campaignId: $campaignId, languageId: $languageId) {
      id
      languages {
        ...CampaignLanguageFields
      }
    }
  }
`

export function useCampaignLanguageRemoveMutation(
  options?: useMutation.Options<
    CampaignLanguageRemove,
    CampaignLanguageRemoveVariables
  >
): useMutation.ResultTuple<
  CampaignLanguageRemove,
  CampaignLanguageRemoveVariables
> {
  return useMutation<CampaignLanguageRemove, CampaignLanguageRemoveVariables>(
    CAMPAIGN_LANGUAGE_REMOVE,
    options
  )
}
