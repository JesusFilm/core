import { GetCampaign_campaign_regions_languages as CampaignRegionLanguage } from '../../../../../__generated__/GetCampaign'
import { useCampaignRegionLanguageUpdateMutation } from '../../../../libs/useCampaignRegionLanguageUpdateMutation'
import { useCampaignCommand } from '../useCampaignCommand'

export interface ShareLanguageLinkCommand {
  /**
   * Link a pasted journey to a Share Language, as one Command: the first link
   * and a swap of the journey it holds alike. Resolves once the API has
   * accepted the link; a refusal rejects with the API's error and adds
   * nothing to the undo stack.
   */
  link: (regionLanguage: CampaignRegionLanguage, url: string) => Promise<void>
}

/**
 * Linking a Share Language's journey is one Command. The API resolves the
 * pasted link, so the request runs before the Command is added (a refused
 * link must reach the paste field and leave nothing to undo) and its execute
 * has nothing left to send. Undo of the first link unlinks the language,
 * which keeps its Campaign QR Code and short link; undo of a swap writes the
 * previous journey back by id and re-applies the snapshot text the author
 * had edited, since linking resets it. Redo links the same journey by id. A
 * swap retargets the Campaign QR Code's short link, so printed codes stay
 * valid across undo and redo. The Campaign Command module runs undo and redo
 * in order after the page they were made on is focused, and reports their
 * refusals in the snackbar.
 */
export function useShareLanguageLinkCommand(): ShareLanguageLinkCommand {
  const { addCampaignCommand } = useCampaignCommand()
  const [languageUpdate] = useCampaignRegionLanguageUpdateMutation()

  async function link(
    regionLanguage: CampaignRegionLanguage,
    url: string
  ): Promise<void> {
    const { data } = await languageUpdate({
      variables: { id: regionLanguage.id, input: { url } }
    })
    const linkedJourneyId = data?.campaignRegionLanguageUpdate.journeyId

    async function restorePrevious(): Promise<void> {
      if (regionLanguage.journeyId == null) {
        await languageUpdate({
          variables: { id: regionLanguage.id, input: { journeyId: null } }
        })
        return
      }
      await languageUpdate({
        variables: {
          id: regionLanguage.id,
          input: { journeyId: regionLanguage.journeyId }
        },
        optimisticResponse: { campaignRegionLanguageUpdate: regionLanguage }
      })
      if (!regionLanguage.snapshotEdited) return
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

    void addCampaignCommand({
      // The link was sent above, before the Command was added.
      execute: async () => undefined,
      undo: restorePrevious,
      redo: async () =>
        await languageUpdate({
          variables: {
            id: regionLanguage.id,
            input:
              linkedJourneyId != null ? { journeyId: linkedJourneyId } : { url }
          }
        })
    })
  }

  return { link }
}
