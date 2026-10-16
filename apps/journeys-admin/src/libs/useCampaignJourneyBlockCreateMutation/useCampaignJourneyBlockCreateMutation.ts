import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import {
  CampaignJourneyBlockCreate,
  CampaignJourneyBlockCreateVariables
} from '../../../__generated__/CampaignJourneyBlockCreate'
import { campaignBlockCreateUpdate } from '../campaignBlockCache'
import { CAMPAIGN_BLOCK_TRANSLATION_FIELDS } from '../useCampaignQuery/campaignFields'

export const CAMPAIGN_JOURNEY_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignJourneyBlockCreate(
    $id: ID
    $parentBlockId: ID!
    $url: String!
    $languageId: ID
  ) {
    campaignJourneyBlockCreate(
      id: $id
      parentBlockId: $parentBlockId
      url: $url
    ) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

/** Add a journey card from a pasted link and append it to the campaign's cached block list. */
export function useCampaignJourneyBlockCreateMutation(
  campaignId: string,
  options?: useMutation.Options<
    CampaignJourneyBlockCreate,
    CampaignJourneyBlockCreateVariables
  >
): useMutation.ResultTuple<
  CampaignJourneyBlockCreate,
  CampaignJourneyBlockCreateVariables
> {
  return useMutation<
    CampaignJourneyBlockCreate,
    CampaignJourneyBlockCreateVariables
  >(CAMPAIGN_JOURNEY_BLOCK_CREATE, {
    update(cache, { data }) {
      campaignBlockCreateUpdate(
        cache,
        campaignId,
        data?.campaignJourneyBlockCreate
      )
    },
    ...options
  })
}
