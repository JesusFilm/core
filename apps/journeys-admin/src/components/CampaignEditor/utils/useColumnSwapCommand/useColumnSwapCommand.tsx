import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { useCampaignBlockOrderUpdateMutation } from '../../../../libs/useCampaignBlockOrderUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { columnSlots } from '../../sectionTypes'
import {
  currentSiblings,
  reorderedSiblings
} from '../useCampaignBlockOrderCommand'
import { useCampaignCommand } from '../useCampaignCommand'
import { useCommandFailure } from '../useCommandFailure'

type OrderRows = ReturnType<typeof currentSiblings>

interface SwapParameters {
  parentOrder: number
  rows: OrderRows
}

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
 * Swapping a Columns section's two slots is one Command: a block order
 * update on a slot to the other slot's position, which the API answers by
 * renumbering both. Every step focuses the block the author had selected
 * (the slot, or the section in it) so the swap is seen; undo writes the
 * position the slot had back through the same mutation.
 */
export function useColumnSwapCommand(): {
  addColumnSwap: (slot: CampaignBlock, selectedBlockId?: string) => void
} {
  const { addCampaignCommand } = useCampaignCommand()
  const { campaign } = useCampaignEditor()
  const [orderUpdate] = useCampaignBlockOrderUpdateMutation()
  const reportFailure = useCommandFailure()

  function addColumnSwap(slot: CampaignBlock, selectedBlockId?: string): void {
    const other = otherSlotOf(campaign.blocks, slot)
    if (other?.parentOrder == null || slot.parentOrder == null) return
    const focus = {
      selectedBlockId: selectedBlockId ?? slot.id,
      selectedRegionId: undefined
    }
    const before: SwapParameters = {
      parentOrder: slot.parentOrder,
      rows: currentSiblings(campaign.blocks, slot)
    }
    const after: SwapParameters = {
      parentOrder: other.parentOrder,
      rows: reorderedSiblings(campaign.blocks, slot, other.parentOrder)
    }

    async function write({
      parentOrder,
      rows
    }: SwapParameters): Promise<unknown> {
      return await orderUpdate({
        variables: { id: slot.id, parentOrder },
        optimisticResponse: { campaignBlockOrderUpdate: rows }
      })
    }

    addCampaignCommand({
      focus: { execute: focus, undo: focus, redo: focus },
      execute: async () => await write(after),
      undo: async () => await write(before)
    }).catch((error: unknown) => reportFailure(error))
  }

  return { addColumnSwap }
}
