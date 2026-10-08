import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignButtonBlockUpdateStyle,
  CampaignButtonBlockUpdateStyleVariables
} from '../../../__generated__/CampaignButtonBlockUpdateStyle'

/** A button Extra's style: `variant`, `size`, `align`, `color` and `labelColor`; the label has its own document. */
export const CAMPAIGN_BUTTON_BLOCK_UPDATE_STYLE = gql`
  mutation CampaignButtonBlockUpdateStyle(
    $id: ID!
    $input: CampaignButtonBlockUpdateInput!
  ) {
    campaignButtonBlockUpdate(id: $id, input: $input) {
      id
      buttonVariant: variant
      size
      align
      color
      labelColor
    }
  }
`

export function useCampaignButtonBlockUpdateMutation(
  options?: useMutation.Options<
    CampaignButtonBlockUpdateStyle,
    CampaignButtonBlockUpdateStyleVariables
  >
): useMutation.ResultTuple<
  CampaignButtonBlockUpdateStyle,
  CampaignButtonBlockUpdateStyleVariables
> {
  return useMutation<
    CampaignButtonBlockUpdateStyle,
    CampaignButtonBlockUpdateStyleVariables
  >(CAMPAIGN_BUTTON_BLOCK_UPDATE_STYLE, options)
}
