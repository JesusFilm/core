import { useState } from 'react'

import { GetCampaign_campaign_regions_languages as CampaignRegionLanguage } from '../../../../../__generated__/GetCampaign'
import { useCampaignRegionLanguageSnapshotRefreshMutation } from '../../../../libs/useCampaignRegionLanguageSnapshotRefreshMutation'
import { useCampaignRegionLanguageUpdateMutation } from '../../../../libs/useCampaignRegionLanguageUpdateMutation'
import { useCampaignCommand } from '../useCampaignCommand'
import { useCommandFailure } from '../useCommandFailure'

interface SnapshotParameters {
  title: string | null
  description: string | null
  snapshotEdited: boolean
}

export interface CampaignRegionLanguageSnapshotRefreshCommand {
  /** Refresh at once, or hold the language for confirmation when the author edited its snapshot. */
  requestRefresh: (regionLanguage: CampaignRegionLanguage) => void
  /** The language whose refresh awaits the author's confirmation. */
  pending?: CampaignRegionLanguage
  confirmRefresh: () => void
  cancelRefresh: () => void
}

/**
 * "Refresh from journey" as a Command: execute (and redo) re-reads the
 * snapshot title and description through `campaignRegionLanguageSnapshotRefresh`,
 * shown optimistically from the journey the editor already holds, which
 * clears the row's edited flag; undo writes the previous title, description
 * and edited flag back through `campaignRegionLanguageUpdate`. The Campaign
 * Command module focuses the page the request was made on before each
 * replay. A snapshot the author edited by hand
 * (the row's `snapshotEdited`; a journey renamed since linking does not count)
 * asks first, so the Command is only added once the author has confirmed.
 */
export function useCampaignRegionLanguageSnapshotRefreshCommand(): CampaignRegionLanguageSnapshotRefreshCommand {
  const { addCampaignCommand } = useCampaignCommand()
  const [snapshotRefresh] = useCampaignRegionLanguageSnapshotRefreshMutation()
  const [languageUpdate] = useCampaignRegionLanguageUpdateMutation()
  const [pending, setPending] = useState<CampaignRegionLanguage>()
  const reportFailure = useCommandFailure()

  function refresh(regionLanguage: CampaignRegionLanguage): void {
    const journey = regionLanguage.journey
    if (journey == null) return
    const refreshed: SnapshotParameters = {
      title: journey.title,
      description: journey.description,
      snapshotEdited: false
    }
    const previous: SnapshotParameters = {
      title: regionLanguage.title,
      description: regionLanguage.description,
      snapshotEdited: regionLanguage.snapshotEdited
    }
    addCampaignCommand({
      execute: async () =>
        await snapshotRefresh({
          variables: { id: regionLanguage.id },
          optimisticResponse: {
            campaignRegionLanguageSnapshotRefresh: {
              ...regionLanguage,
              ...refreshed
            }
          }
        }),
      undo: async () =>
        await languageUpdate({
          variables: { id: regionLanguage.id, input: previous },
          optimisticResponse: {
            campaignRegionLanguageUpdate: { ...regionLanguage, ...previous }
          }
        })
    }).catch((error: unknown) => reportFailure(error))
  }

  function requestRefresh(regionLanguage: CampaignRegionLanguage): void {
    if (regionLanguage.journey == null) return
    if (regionLanguage.snapshotEdited) {
      setPending(regionLanguage)
      return
    }
    refresh(regionLanguage)
  }

  function confirmRefresh(): void {
    if (pending == null) return
    setPending(undefined)
    refresh(pending)
  }

  function cancelRefresh(): void {
    setPending(undefined)
  }

  return { requestRefresh, pending, confirmRefresh, cancelRefresh }
}
