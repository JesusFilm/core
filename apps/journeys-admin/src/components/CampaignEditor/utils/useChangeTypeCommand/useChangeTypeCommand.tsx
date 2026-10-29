import { v4 as uuidv4 } from 'uuid'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { useCampaignBlockDeleteMutation } from '../../../../libs/useCampaignBlockDeleteMutation'
import { useCampaignBlockRestoreMutation } from '../../../../libs/useCampaignBlockRestoreMutation'
import {
  CampaignSectionTypename,
  useCampaignSectionCreateMutation
} from '../../../../libs/useCampaignSectionCreateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { newSectionBlock } from '../../sectionTypes'
import { CampaignFlushContext, useCampaignCommand } from '../useCampaignCommand'
import { useCommandFailure } from '../useCommandFailure'

/**
 * Changing the type of the section in a Column Slot is one Command: execute
 * soft-deletes the slot's section and creates the chosen type in the same
 * slot; undo deletes the new section and restores the old one with its Extras
 * and text; redo deletes the old one again and restores the new. The second
 * request of each pair waits for the first, because a slot holds one section
 * at a time and the API refuses a second. If the create is refused after the
 * delete went through, the old section is restored so the column is never
 * left empty; undo then sends nothing (even when pressed while the change
 * was in flight) and redo runs the whole change again. Each delete first
 * sends the slot's text edits still waiting on their debounce, so a
 * late-landing save cannot overtake it. A refused change is raised in the
 * editor's error snackbar.
 */
export function useChangeTypeCommand(): {
  addChangeType: (
    section: CampaignBlock,
    typename: CampaignSectionTypename
  ) => void
} {
  const { addCampaignCommand } = useCampaignCommand()
  const { campaign } = useCampaignEditor()
  const [blockDelete] = useCampaignBlockDeleteMutation(campaign.id)
  const [blockRestore] = useCampaignBlockRestoreMutation(campaign.id)
  const sectionCreate = useCampaignSectionCreateMutation(campaign.id)
  const reportFailure = useCommandFailure()

  async function remove(
    block: CampaignBlock,
    flushContext: CampaignFlushContext
  ): Promise<unknown> {
    return await blockDelete({
      variables: { id: block.id },
      optimisticResponse: { campaignBlockDelete: [] },
      context: flushContext
    })
  }

  async function restore(block: CampaignBlock): Promise<unknown> {
    return await blockRestore({
      variables: { id: block.id },
      optimisticResponse: { campaignBlockRestore: [block] }
    })
  }

  function addChangeType(
    section: CampaignBlock,
    typename: CampaignSectionTypename
  ): void {
    const { parentBlockId, pageId } = section
    if (parentBlockId == null || pageId == null) return
    const next = newSectionBlock(typename, {
      id: uuidv4(),
      campaignId: campaign.id,
      pageId,
      parentBlockId,
      parentOrder: 0
    })

    addCampaignCommand({
      // The Column Slot: its subtree is whichever section it holds.
      flush: { __typename: 'CampaignColumnBlock', id: parentBlockId },
      focus: {
        execute: { selectedBlockId: next.id, selectedRegionId: undefined },
        undo: { selectedBlockId: section.id, selectedRegionId: undefined },
        redo: { selectedBlockId: next.id, selectedRegionId: undefined }
      },
      async execute({ flushContext }) {
        await remove(section, flushContext)
        try {
          await sectionCreate(next, {
            id: next.id,
            campaignId: campaign.id,
            pageId,
            parentBlockId,
            parentOrder: 0
          })
        } catch (error) {
          await restore(section).catch(() => undefined)
          throw error
        }
      },
      async undo({ flushContext }) {
        await remove(next, flushContext)
        await restore(section)
      },
      async redo({ flushContext }) {
        await remove(section, flushContext)
        await restore(next)
      }
    }).catch((error: unknown) => reportFailure(error))
  }

  return { addChangeType }
}
