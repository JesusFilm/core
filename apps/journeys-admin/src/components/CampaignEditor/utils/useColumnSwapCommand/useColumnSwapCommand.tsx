import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { useCampaignBlockOrderUpdateMutation } from '../../../../libs/useCampaignBlockOrderUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { columnSlots } from '../../sectionTypes'
import {
  currentSiblings,
  reorderedSiblings
} from '../useCampaignBlockOrderCommand'

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
 * renumbering both. Execute and undo both focus the page and the block the
 * author had selected (the slot, or the section in it) so the swap is seen;
 * undo writes the position the slot had back through the same mutation.
 */
export function useColumnSwapCommand(): {
  addColumnSwap: (slot: CampaignBlock, selectedBlockId?: string) => void
} {
  const { add } = useCommand()
  const {
    campaign,
    state: { pageKind },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const [orderUpdate] = useCampaignBlockOrderUpdateMutation()

  function addColumnSwap(slot: CampaignBlock, selectedBlockId?: string): void {
    const other = otherSlotOf(campaign.blocks, slot)
    if (other?.parentOrder == null || slot.parentOrder == null) return
    const slotPageKind = pageKindOf(slot) ?? pageKind
    const focus = selectedBlockId ?? slot.id
    const before: SwapParameters = {
      parentOrder: slot.parentOrder,
      rows: currentSiblings(campaign.blocks, slot)
    }
    const after: SwapParameters = {
      parentOrder: other.parentOrder,
      rows: reorderedSiblings(campaign.blocks, slot, other.parentOrder)
    }

    add<SwapParameters>({
      parameters: { execute: after, undo: before },
      execute({ parentOrder, rows }) {
        dispatch({
          type: 'SetEditorFocusAction',
          pageKind: slotPageKind,
          selectedBlockId: focus
        })
        void orderUpdate({
          variables: { id: slot.id, parentOrder },
          optimisticResponse: { campaignBlockOrderUpdate: rows }
        })
      }
    })
  }

  return { addColumnSwap }
}
