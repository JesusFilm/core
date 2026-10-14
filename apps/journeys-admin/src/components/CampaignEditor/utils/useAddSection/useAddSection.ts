import { v4 as uuidv4 } from 'uuid'

import {
  CampaignSectionTypename,
  useCampaignSectionCreateMutation
} from '../../../../libs/useCampaignSectionCreateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { newColumnSlots, newSectionBlock } from '../../sectionTypes'
import { useCampaignBlockCreateCommand } from '../useCampaignBlockCreateCommand'

/**
 * Where a new section goes: a page and a position among its sections, or a
 * Column Slot, whose one section is always at position 0.
 */
export interface SectionInsert {
  pageId: string
  parentOrder: number
  parentBlockId?: string
}

/**
 * The create Command of a new section at an insert point: a Columns section
 * is born with its two empty slots. Shared by the bottom bar's Add menus and
 * the Inspector's column type picker.
 */
export function useAddSection(): (
  typename: CampaignSectionTypename,
  insert: SectionInsert
) => void {
  const { campaign } = useCampaignEditor()
  const { addBlock } = useCampaignBlockCreateCommand()
  const sectionCreate = useCampaignSectionCreateMutation(campaign.id)

  return function addSection(typename, insert): void {
    const id = uuidv4()
    const block = newSectionBlock(typename, {
      id,
      campaignId: campaign.id,
      ...insert
    })
    const slotIds: [string, string] | undefined =
      typename === 'CampaignColumnsBlock' ? [uuidv4(), uuidv4()] : undefined
    const input = {
      id,
      campaignId: campaign.id,
      ...insert,
      ...(slotIds != null ? { slotIds } : {})
    }
    const slots = slotIds != null ? newColumnSlots(block, slotIds) : []
    addBlock({
      block,
      execute() {
        void sectionCreate(block, input, slots)
      }
    })
  }
}
