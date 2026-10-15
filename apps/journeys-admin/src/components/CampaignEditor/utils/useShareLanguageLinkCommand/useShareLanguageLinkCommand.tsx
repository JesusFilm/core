import noop from 'lodash/noop'
import { useSnackbar } from 'notistack'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_regions_languages as CampaignRegionLanguage } from '../../../../../__generated__/GetCampaign'
import { useCampaignRegionLanguageUpdateMutation } from '../../../../libs/useCampaignRegionLanguageUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { messageOf } from '../messageOf'

export interface ShareLanguageLinkCommand {
  /**
   * Link a pasted journey to a Share Language, or swap the one it holds, as one
   * Command. Resolves once the API has accepted the link; a refusal rejects
   * with the API's error and adds nothing to the undo stack.
   */
  link: (regionLanguage: CampaignRegionLanguage, url: string) => Promise<void>
}

/**
 * Linking or swapping a Share Language's journey is one Command. The API
 * resolves the pasted link, so the request runs before the Command is added
 * (a refused link must reach the paste field and leave nothing to undo) and
 * its execute has nothing left to do. Undo writes the previous journey back by
 * id, or unlinks a language that held none, and re-applies the snapshot text
 * the author had edited, since linking resets it; redo links the same journey
 * by id. A swap retargets the Campaign QR Code's short link, so printed codes
 * stay valid across undo; undoing the first link removes the code it created
 * and redo makes a new one. Both focus the page the link was made on first.
 */
export function useShareLanguageLinkCommand(): ShareLanguageLinkCommand {
  const { add } = useCommand()
  const { enqueueSnackbar } = useSnackbar()
  const { state, dispatch } = useCampaignEditor()
  const [languageUpdate] = useCampaignRegionLanguageUpdateMutation()

  async function link(
    regionLanguage: CampaignRegionLanguage,
    url: string
  ): Promise<void> {
    const focus = {
      pageKind: state.pageKind,
      regionId: state.regionId,
      selectedBlockId: state.selectedBlockId,
      selectedRegionId: state.selectedRegionId
    }
    const { data } = await languageUpdate({
      variables: { id: regionLanguage.id, input: { url } }
    })
    const linkedJourneyId = data?.campaignRegionLanguageUpdate.journeyId

    function notify(error: unknown): void {
      enqueueSnackbar(messageOf(error), {
        variant: 'error',
        preventDuplicate: true
      })
    }

    async function restorePrevious(): Promise<void> {
      await languageUpdate({
        variables: {
          id: regionLanguage.id,
          input: { journeyId: regionLanguage.journeyId }
        },
        optimisticResponse: { campaignRegionLanguageUpdate: regionLanguage }
      })
      if (regionLanguage.journeyId == null || !regionLanguage.snapshotEdited)
        return
      await languageUpdate({
        variables: {
          id: regionLanguage.id,
          input: {
            title: regionLanguage.title,
            description: regionLanguage.description,
            snapshotEdited: true
          }
        }
      })
    }

    add({
      parameters: { execute: {}, undo: {}, redo: {} },
      execute: noop,
      undo() {
        dispatch({ type: 'SetEditorFocusAction', ...focus })
        restorePrevious().catch(notify)
      },
      redo() {
        dispatch({ type: 'SetEditorFocusAction', ...focus })
        languageUpdate({
          variables: {
            id: regionLanguage.id,
            input:
              linkedJourneyId != null ? { journeyId: linkedJourneyId } : { url }
          }
        }).catch(notify)
      }
    })
  }

  return { link }
}
