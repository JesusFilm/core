import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import {
  CampaignTypographyBlockCreate,
  CampaignTypographyBlockCreateVariables
} from '../../../__generated__/CampaignTypographyBlockCreate'
import { CAMPAIGN_BLOCK_TRANSLATION_FIELDS } from '../useCampaignQuery/campaignFields'
import { campaignBlockCreateUpdate } from '../campaignBlockCache'

export const CAMPAIGN_TYPOGRAPHY_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignTypographyBlockCreate(
    $input: CampaignTypographyBlockCreateInput!
  ) {
    campaignTypographyBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

/** Create a text Extra and append it to the campaign's cached block list. */
export function useCampaignTypographyBlockCreateMutation(
  campaignId: string,
  options?: useMutation.Options<
    CampaignTypographyBlockCreate,
    CampaignTypographyBlockCreateVariables
  >
): useMutation.ResultTuple<
  CampaignTypographyBlockCreate,
  CampaignTypographyBlockCreateVariables
> {
  return useMutation<
    CampaignTypographyBlockCreate,
    CampaignTypographyBlockCreateVariables
  >(CAMPAIGN_TYPOGRAPHY_BLOCK_CREATE, {
    update(cache, { data }) {
      campaignBlockCreateUpdate(
        cache,
        campaignId,
        data?.campaignTypographyBlockCreate
      )
    },
    ...options
  })
}
