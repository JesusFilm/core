import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { columnSlots } from '../sectionTypes'
import { useCampaignBlockOrderCommand } from '../useCampaignBlockOrderCommand'

/** The other Column Slot of the same Columns section, if the block is a slot. */
export function otherSlotOf(
  blocks: CampaignBlock[],
  slot: CampaignBlock
): CampaignBlock | undefined {
  if (slot.__typename !== 'CampaignColumnBlock' || slot.parentBlockId == null)
    return undefined
  return columnSlots(blocks, slot.parentBlockId).find(
    (candidate) => candidate.id !== slot.id
  )
}

/**
 * Swapping a Columns section's two slots is one Command: the block order
 * Command moving a slot to the other slot's position, which the API answers
 * by renumbering both. Every step focuses the block the author had selected
 * (the slot, or the section in it) so the swap is seen; undo writes the
 * position the slot had back.
 */
export function useCampaignColumnSwapCommand(): {
  addColumnSwap: (slot: CampaignBlock, selectedBlockId?: string) => void
} {
  const { campaign } = useCampaignEditor()
  const { addBlockOrder } = useCampaignBlockOrderCommand()

  function addColumnSwap(slot: CampaignBlock, selectedBlockId?: string): void {
    const other = otherSlotOf(campaign.blocks, slot)
    if (other?.parentOrder == null) return
    addBlockOrder(
      slot,
      other.parentOrder,
      undefined,
      selectedBlockId ?? slot.id
    )
  }

  return { addColumnSwap }
}
