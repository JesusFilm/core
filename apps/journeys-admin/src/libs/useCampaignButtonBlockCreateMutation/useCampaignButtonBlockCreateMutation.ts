import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import {
  CampaignButtonBlockCreate,
  CampaignButtonBlockCreateVariables
} from '../../../__generated__/CampaignButtonBlockCreate'
import { campaignBlockCreateUpdate } from '../campaignBlockCache'

export const CAMPAIGN_BUTTON_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignButtonBlockCreate($input: CampaignButtonBlockCreateInput!) {
    campaignButtonBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

/** Create a button Extra and append it to the campaign's cached block list. */
export function useCampaignButtonBlockCreateMutation(
  campaignId: string,
  options?: useMutation.Options<
    CampaignButtonBlockCreate,
    CampaignButtonBlockCreateVariables
  >
): useMutation.ResultTuple<
  CampaignButtonBlockCreate,
  CampaignButtonBlockCreateVariables
> {
  return useMutation<
    CampaignButtonBlockCreate,
    CampaignButtonBlockCreateVariables
  >(CAMPAIGN_BUTTON_BLOCK_CREATE, {
    update(cache, { data }) {
      campaignBlockCreateUpdate(
        cache,
        campaignId,
        data?.campaignButtonBlockCreate
      )
    },
    ...options
  })
}
