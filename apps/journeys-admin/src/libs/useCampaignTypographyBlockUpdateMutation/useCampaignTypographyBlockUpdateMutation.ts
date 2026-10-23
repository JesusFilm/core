import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignTypographyBlockUpdateStyle,
  CampaignTypographyBlockUpdateStyleVariables
} from '../../../__generated__/CampaignTypographyBlockUpdateStyle'

/** A text Extra's style: `variant` (size), `align` and `color`; the content has its own document. */
export const CAMPAIGN_TYPOGRAPHY_BLOCK_UPDATE_STYLE = gql`
  mutation CampaignTypographyBlockUpdateStyle(
    $id: ID!
    $input: CampaignTypographyBlockUpdateInput!
  ) {
    campaignTypographyBlockUpdate(id: $id, input: $input) {
      id
      typographyVariant: variant
      align
      color
    }
  }
`

export function useCampaignTypographyBlockUpdateMutation(
  options?: useMutation.Options<
    CampaignTypographyBlockUpdateStyle,
    CampaignTypographyBlockUpdateStyleVariables
  >
): useMutation.ResultTuple<
  CampaignTypographyBlockUpdateStyle,
  CampaignTypographyBlockUpdateStyleVariables
> {
  return useMutation<
    CampaignTypographyBlockUpdateStyle,
    CampaignTypographyBlockUpdateStyleVariables
  >(CAMPAIGN_TYPOGRAPHY_BLOCK_UPDATE_STYLE, options)
}
