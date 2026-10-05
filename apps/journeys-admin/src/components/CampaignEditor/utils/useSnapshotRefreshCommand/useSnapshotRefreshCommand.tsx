import { useState } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_regions_languages as CampaignRegionLanguage } from '../../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import { useCampaignRegionLanguageSnapshotRefreshMutation } from '../../../../libs/useCampaignRegionLanguageSnapshotRefreshMutation'
import { useCampaignRegionLanguageUpdateMutation } from '../../../../libs/useCampaignRegionLanguageUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'

/**
 * Whether the author's snapshot differs from what the journey says now. The
 * row keeps no edited flag, so this is the one signal the editor has: a
 * snapshot that still matches the journey has nothing to lose and refreshes
 * without a word; one that differs is the author's wording until they say
 * otherwise, so it asks first.
 */
export function snapshotEdited(
  regionLanguage: Pick<
    CampaignRegionLanguage,
    'title' | 'description' | 'journey'
  >
): boolean {
  const journey = regionLanguage.journey
  if (journey == null) return false
  return (
    regionLanguage.title !== journey.title ||
    regionLanguage.description !== journey.description
  )
}

interface SnapshotParameters {
  title: string | null
  description: string | null
}

interface Focus {
  pageKind: CampaignPageKind
  regionId?: string
  selectedBlockId?: string
  selectedRegionId?: string
}

export interface SnapshotRefreshCommand {
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
 * shown optimistically from the journey the editor already holds; undo
 * writes the previous title and description back through
 * `campaignRegionLanguageUpdate`. Both focus the page the request was made
 * on first. The Command is only added once the author has confirmed, when a
 * confirmation was needed at all.
 */
export function useSnapshotRefreshCommand(): SnapshotRefreshCommand {
  const { add } = useCommand()
  const { state, dispatch } = useCampaignEditor()
  const [snapshotRefresh] = useCampaignRegionLanguageSnapshotRefreshMutation()
  const [languageUpdate] = useCampaignRegionLanguageUpdateMutation()
  const [pending, setPending] = useState<CampaignRegionLanguage>()

  function currentFocus(): Focus {
    return {
      pageKind: state.pageKind,
      regionId: state.regionId,
      selectedBlockId: state.selectedBlockId,
      selectedRegionId: state.selectedRegionId
    }
  }

  function focus(target: Focus): void {
    dispatch({ type: 'SetEditorFocusAction', ...target })
  }

  function refresh(regionLanguage: CampaignRegionLanguage): void {
    const journey = regionLanguage.journey
    if (journey == null) return
    const target = currentFocus()
    add<SnapshotParameters>({
      parameters: {
        execute: { title: journey.title, description: journey.description },
        undo: {
          title: regionLanguage.title,
          description: regionLanguage.description
        }
      },
      execute({ title, description }) {
        focus(target)
        void snapshotRefresh({
          variables: { id: regionLanguage.id },
          optimisticResponse: {
            campaignRegionLanguageSnapshotRefresh: {
              ...regionLanguage,
              title,
              description
            }
          }
        })
      },
      undo({ title, description }) {
        focus(target)
        void languageUpdate({
          variables: { id: regionLanguage.id, input: { title, description } },
          optimisticResponse: {
            campaignRegionLanguageUpdate: {
              ...regionLanguage,
              title,
              description
            }
          }
        })
      }
    })
  }

  function requestRefresh(regionLanguage: CampaignRegionLanguage): void {
    if (regionLanguage.journey == null) return
    if (snapshotEdited(regionLanguage)) {
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
