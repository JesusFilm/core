import { v4 as uuidv4 } from 'uuid'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import { useCampaignBlockDeleteMutation } from '../../../../libs/useCampaignBlockDeleteMutation'
import { useCampaignBlockRestoreMutation } from '../../../../libs/useCampaignBlockRestoreMutation'
import {
  CampaignSectionTypename,
  useCampaignSectionCreateMutation
} from '../../../../libs/useCampaignSectionCreateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { newSectionBlock } from '../../sectionTypes'

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
 * at a time and the API refuses a second.
 */
export function useChangeTypeCommand(): {
  addChangeType: (
    section: CampaignBlock,
    typename: CampaignSectionTypename
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
      optimisticResponse: { campaignBlockDelete: [] }
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
    if (section.parentBlockId == null || section.pageId == null) return
    const next = newSectionBlock(typename, {
      id: uuidv4(),
      campaignId: campaign.id,
      pageId: section.pageId,
      parentBlockId: section.parentBlockId,
      parentOrder: 0
    })
    const parameters: ChangeTypeParameters = {
      previous: section,
      next,
      pageKind: pageKindOf(section) ?? pageKind
    }

    add<Record<string, never>, ChangeTypeParameters, ChangeTypeParameters>({
      parameters: { execute: {}, undo: parameters, redo: parameters },
      execute() {
        focus(parameters, next)
        void remove(section).then(
          async () =>
            await sectionCreate(next, {
              id: next.id,
              campaignId: campaign.id,
              pageId: section.pageId as string,
              parentBlockId: section.parentBlockId as string,
              parentOrder: 0
            })
        )
      },
      undo(target) {
        focus(target, target.previous)
        void remove(target.next).then(
          async () => await restore(target.previous)
        )
      },
      redo(target) {
        focus(target, target.next)
        void remove(target.previous).then(
          async () => await restore(target.next)
        )
      }
    })
  }

  return { addChangeType }
}
