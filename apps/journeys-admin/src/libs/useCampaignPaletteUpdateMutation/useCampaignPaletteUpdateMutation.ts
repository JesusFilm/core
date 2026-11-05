import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignPaletteUpdate,
  CampaignPaletteUpdateVariables
} from '../../../__generated__/CampaignPaletteUpdate'

/**
 * The Palette is picker chrome: saved through `campaignUpdate` on picker
 * blur, outside any Command, so undo never rewinds it.
 */
export const CAMPAIGN_PALETTE_UPDATE = gql`
  mutation CampaignPaletteUpdate($id: ID!, $input: CampaignUpdateInput!) {
    campaignUpdate(id: $id, input: $input) {
      id
      palette
    }
  }
`

export function useCampaignPaletteUpdateMutation(
  options?: useMutation.Options<
    CampaignPaletteUpdate,
    CampaignPaletteUpdateVariables
  >
): useMutation.ResultTuple<
  CampaignPaletteUpdate,
  CampaignPaletteUpdateVariables
> {
  return useMutation<CampaignPaletteUpdate, CampaignPaletteUpdateVariables>(
    CAMPAIGN_PALETTE_UPDATE,
    options
  )
}
