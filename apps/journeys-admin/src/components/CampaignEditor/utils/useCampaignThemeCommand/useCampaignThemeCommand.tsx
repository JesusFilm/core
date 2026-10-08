import { useSnackbar } from 'notistack'
import { useRef } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { CampaignThemeUpdate_campaignThemeUpdate as CampaignThemeRow } from '../../../../../__generated__/CampaignThemeUpdate'
import { GetCampaign_campaign_theme as CampaignTheme } from '../../../../../__generated__/GetCampaign'
import { CampaignThemeUpdateInput } from '../../../../../__generated__/globalTypes'
import { useCampaignThemeUpdateMutation } from '../../../../libs/useCampaignThemeUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { messageOf, previousOf } from '../useCampaignStyleCommand'

export interface CampaignThemeCommand {
  /** Write any Campaign Theme columns as one Command: a colour, a font, a radius, the mode, or a whole preset. */
  addTheme: (input: CampaignThemeUpdateInput) => void
}

/**
 * The row `campaignThemeUpdate` returns, as the theme stands with `input`
 * applied: an omitted column keeps its value, a font set to null returns to
 * the default, and the non-null columns ignore a null the editor never sends.
 */
export function campaignThemeRow(
  current: CampaignTheme,
  input: CampaignThemeUpdateInput
): CampaignThemeRow {
  return {
    __typename: 'CampaignTheme',
    id: current.id,
    themeMode: input.themeMode ?? current.themeMode,
    headerFont:
      input.headerFont === undefined ? current.headerFont : input.headerFont,
    bodyFont: input.bodyFont === undefined ? current.bodyFont : input.bodyFont,
    labelFont:
      input.labelFont === undefined ? current.labelFont : input.labelFont,
    primaryColor: input.primaryColor ?? current.primaryColor,
    accentColor: input.accentColor ?? current.accentColor,
    backgroundColor: input.backgroundColor ?? current.backgroundColor,
    surfaceColor: input.surfaceColor ?? current.surfaceColor,
    textColor: input.textColor ?? current.textColor,
    mutedColor: input.mutedColor ?? current.mutedColor,
    contrastBackgroundColor:
      input.contrastBackgroundColor ?? current.contrastBackgroundColor,
    contrastTextColor: input.contrastTextColor ?? current.contrastTextColor,
    radius: input.radius ?? current.radius,
    buttonRadius: input.buttonRadius ?? current.buttonRadius
  }
}

/**
 * Every theme edit is one Command through `campaignThemeUpdate` with an
 * optimistic response: execute writes the given columns, undo writes the
 * values the theme had back through the same mutation, redo writes the
 * change again. A failed save raises the API's message, verbatim, in the
 * editor's error snackbar, which outlives the panel so an undo or redo from
 * the top bar after the drawer closes still reports its failure. A preset is the mode and the eight colours in one input, so
 * one undo restores all nine. The optimistic row is built from the theme as
 * the cache holds it when the Command runs, so an undo never resurrects
 * columns changed since.
 */
export function useCampaignThemeCommand(): CampaignThemeCommand {
  const { add } = useCommand()
  const { campaign } = useCampaignEditor()
  const [themeUpdate] = useCampaignThemeUpdateMutation()
  const themeRef = useRef(campaign.theme)
  themeRef.current = campaign.theme
  const { enqueueSnackbar } = useSnackbar()

  function addTheme(input: CampaignThemeUpdateInput): void {
    add<CampaignThemeUpdateInput>({
      parameters: {
        execute: input,
        undo: previousOf(campaign.theme, input),
        redo: input
      },
      execute(next) {
        const current = themeRef.current
        void themeUpdate({
          variables: { id: current.id, input: next },
          optimisticResponse: {
            campaignThemeUpdate: campaignThemeRow(current, next)
          }
        }).catch((mutationError: unknown) => {
          enqueueSnackbar(messageOf(mutationError), {
            variant: 'error',
            preventDuplicate: true
          })
        })
      }
    })
  }

  return { addTheme }
}
