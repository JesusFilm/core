import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignThemeUpdate,
  CampaignThemeUpdateVariables
} from '../../../__generated__/CampaignThemeUpdate'

/**
 * The one mutation every Campaign Theme edit goes through: a colour, a font,
 * a radius, the mode, or a Theme Preset (the mode and the eight colours at
 * once). It returns the whole row so the cache's `CampaignTheme` updates in
 * place and the canvas re-themes.
 */
export const CAMPAIGN_THEME_UPDATE = gql`
  mutation CampaignThemeUpdate($id: ID!, $input: CampaignThemeUpdateInput!) {
    campaignThemeUpdate(id: $id, input: $input) {
      id
      themeMode
      headerFont
      bodyFont
      labelFont
      primaryColor
      accentColor
      backgroundColor
      surfaceColor
      textColor
      mutedColor
      contrastBackgroundColor
      contrastTextColor
      radius
      buttonRadius
    }
  }
`

export function useCampaignThemeUpdateMutation(
  options?: useMutation.Options<
    CampaignThemeUpdate,
    CampaignThemeUpdateVariables
  >
): useMutation.ResultTuple<CampaignThemeUpdate, CampaignThemeUpdateVariables> {
  return useMutation<CampaignThemeUpdate, CampaignThemeUpdateVariables>(
    CAMPAIGN_THEME_UPDATE,
    options
  )
}
