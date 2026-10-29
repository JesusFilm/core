import { v4 as uuidv4 } from 'uuid'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import { useCampaignBlockDeleteMutation } from '../../../../libs/useCampaignBlockDeleteMutation'
import { useCampaignBlockRestoreMutation } from '../../../../libs/useCampaignBlockRestoreMutation'
import {
  AddableSectionTypename,
  useCampaignSectionCreateMutation
} from '../../../../libs/useCampaignSectionCreateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { newSectionBlock } from '../../sectionTypes'
import { textDebounceKeyPrefix } from '../useCampaignTextCommand'
import { useCommandFailure } from '../useCommandFailure'

interface ChangeTypeParameters {
  /** The section the slot held before the change. */
  previous: CampaignBlock
  /** The section of the chosen type that takes its place. */
  next: CampaignBlock
  pageKind: CampaignPageKind
}

/**
 * Changing the type of the section in a Column Slot is one Command: execute
 * soft-deletes the slot's section and creates the chosen type in the same
 * slot; undo deletes the new section and restores the old one with its Extras
 * and text; redo deletes the old one again and restores the new. The second
 * request of each pair waits for the first, because a slot holds one section
 * at a time and the API refuses a second. If the create is refused after the
 * delete went through, the old section is restored so the column is never
 * left empty, and undo carries on to its restore even when its delete finds
 * nothing to remove (the new section never existed). Redo of a refused create
 * runs the whole change again. Each delete first sends the section's text
 * edits still waiting on their debounce, so a late-landing save cannot
 * overtake it. Every other refusal, the create included, is raised in the
 * editor's error snackbar.
 */
export function useChangeTypeCommand(): {
  addChangeType: (
    section: CampaignBlock,
    typename: AddableSectionTypename
  ) => void
} {
  const { add } = useCommand()
  const {
    campaign,
    state: { pageKind },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const [blockDelete] = useCampaignBlockDeleteMutation(campaign.id)
  const [blockRestore] = useCampaignBlockRestoreMutation(campaign.id)
  const sectionCreate = useCampaignSectionCreateMutation(campaign.id)
  const reportFailure = useCommandFailure()

  function focus(target: ChangeTypeParameters, block: CampaignBlock): void {
    dispatch({
      type: 'SetEditorFocusAction',
      pageKind: target.pageKind,
      selectedBlockId: block.id
    })
  }

  async function remove(block: CampaignBlock): Promise<unknown> {
    return await blockDelete({
      variables: { id: block.id },
      optimisticResponse: { campaignBlockDelete: [] },
      context: { debounceFlushPrefix: textDebounceKeyPrefix(block) }
    })
  }

  async function restore(block: CampaignBlock): Promise<unknown> {
    return await blockRestore({
      variables: { id: block.id },
      optimisticResponse: { campaignBlockRestore: [block] }
    })
  }

  async function replace(
    outgoing: CampaignBlock,
    incoming: CampaignBlock,
    outgoingExists: boolean
  ): Promise<void> {
    try {
      await remove(outgoing)
    } catch (error) {
      if (outgoingExists) reportFailure(error)
    }
    await restore(incoming).catch(reportFailure)
  }

  function addChangeType(
    section: CampaignBlock,
    typename: AddableSectionTypename
  ): void {
    if (section.parentBlockId == null || section.pageId == null) return
    const next = newSectionBlock(typename, {
      id: uuidv4(),
      campaignId: campaign.id,
      pageId: section.pageId,
      parentBlockId: section.parentBlockId,
      parentOrder: 0
    })
    let nextExists = true
    const parameters: ChangeTypeParameters = {
      previous: section,
      next,
      pageKind: pageKindOf(section) ?? pageKind
    }

    function change(): void {
      void remove(section)
        .then(async () => {
          try {
            await sectionCreate(next, {
              id: next.id,
              campaignId: campaign.id,
              pageId: section.pageId as string,
              parentBlockId: section.parentBlockId as string,
              parentOrder: 0
            })
            nextExists = true
          } catch (error) {
            nextExists = false
            reportFailure(error)
            await restore(section)
          }
        })
        .catch(reportFailure)
    }

    add<Record<string, never>, ChangeTypeParameters, ChangeTypeParameters>({
      parameters: { execute: {}, undo: parameters, redo: parameters },
      execute() {
        focus(parameters, next)
        change()
      },
      undo(target) {
        focus(target, target.previous)
        void replace(target.next, target.previous, nextExists)
      },
      redo(target) {
        focus(target, target.next)
        if (!nextExists) {
          change()
          return
        }
        void replace(target.previous, target.next, true)
      }
    })
  }

  return { addChangeType }
}
