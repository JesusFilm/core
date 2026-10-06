import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import {
  CampaignJourneyBlockCreate,
  CampaignJourneyBlockCreateVariables
} from '../../../__generated__/CampaignJourneyBlockCreate'
import { campaignBlockCreateUpdate } from '../campaignBlockCache'

export const CAMPAIGN_JOURNEY_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignJourneyBlockCreate(
    $id: ID
    $parentBlockId: ID!
    $url: String!
  ) {
    campaignJourneyBlockCreate(
      id: $id
      parentBlockId: $parentBlockId
      url: $url
    ) {
      ...CampaignPublicBlockFields
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
