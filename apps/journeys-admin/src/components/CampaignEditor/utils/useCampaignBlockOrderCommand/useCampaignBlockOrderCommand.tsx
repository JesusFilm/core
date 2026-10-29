import sortBy from 'lodash/sortBy'

import { CampaignBlockOrderUpdate } from '../../../../../__generated__/CampaignBlockOrderUpdate'
import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { CampaignChildPlacement } from '../../../../../__generated__/globalTypes'
import { CampaignBlockOrder } from '../../../../libs/campaignBlockCache'
import { useCampaignBlockOrderUpdateMutation } from '../../../../libs/useCampaignBlockOrderUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { siblingRows, siblingsOf } from '../siblingsOf'
import { useCampaignCommand } from '../useCampaignCommand'
import { useCommandFailure } from '../useCommandFailure'

type OrderRows = CampaignBlockOrderUpdate['campaignBlockOrderUpdate']

/** A sibling's row as the order mutation returns it; an Extra carries its placement. */
type OrderRow = CampaignBlockOrder & {
  placement?: CampaignChildPlacement | null
}

/** The blocks' rows in the given order, numbered from 0, with their placements. */
function orderRows(blocks: CampaignBlock[]): OrderRows {
  const rows: OrderRow[] = siblingRows(blocks).map((row, index) => {
    const block = blocks[index]
    return 'placement' in block ? { ...row, placement: block.placement } : row
  })
  return rows as unknown as OrderRows
}

/** A block's siblings and itself in their current order, as the order mutation returns them. */
export function currentSiblings(
  blocks: CampaignBlock[],
  block: CampaignBlock
): OrderRows {
  return orderRows(sortBy([...siblingsOf(blocks, block), block], 'parentOrder'))
}

/**
 * The rows the move produces, computed from the cached siblings: the block
 * at `parentOrder` (clamped to the end) with its new placement, everyone
 * renumbered contiguously.
 */
export function reorderedSiblings(
  blocks: CampaignBlock[],
  block: CampaignBlock,
  parentOrder: number,
  placement?: CampaignChildPlacement | null
): OrderRows {
  const others = siblingsOf(blocks, block)
  const moved =
    placement != null && 'placement' in block ? { ...block, placement } : block
  others.splice(Math.min(parentOrder, others.length), 0, moved)
  return orderRows(others)
}

/**
 * Moving a block is one Command: execute writes the new position (and, for
 * an Extra crossing the Section Body, its placement) with the renumbered
 * siblings shown at once; undo writes the position and placement it had back
 * through the same mutation. Every step selects the block, or `focusBlockId`
 * when given (a Column Slot swap keeps the section in the slot selected).
 */
export function useCampaignBlockOrderCommand(): {
  addBlockOrder: (
    block: CampaignBlock,
    parentOrder: number,
    placement?: CampaignChildPlacement | null,
    focusBlockId?: string
  ) => void
} {
  const { addCampaignCommand } = useCampaignCommand()
  const { campaign } = useCampaignEditor()
  const [orderUpdate] = useCampaignBlockOrderUpdateMutation()
  const reportFailure = useCommandFailure()

  function addBlockOrder(
    block: CampaignBlock,
    parentOrder: number,
    placement?: CampaignChildPlacement | null,
    focusBlockId: string = block.id
  ): void {
    if (block.parentOrder == null) return
    const before = {
      parentOrder: block.parentOrder,
      placement: 'placement' in block ? block.placement : undefined,
      rows: currentSiblings(campaign.blocks, block)
    }
    const after = {
      parentOrder,
      placement,
      rows: reorderedSiblings(campaign.blocks, block, parentOrder, placement)
    }

    async function write({
      parentOrder: nextParentOrder,
      placement: nextPlacement,
      rows
    }: typeof after): Promise<unknown> {
      return await orderUpdate({
        variables: {
          id: block.id,
          parentOrder: nextParentOrder,
          ...(nextPlacement != null ? { placement: nextPlacement } : {})
        },
        optimisticResponse: { campaignBlockOrderUpdate: rows }
      })
    }

    const focus = { selectedBlockId: focusBlockId, selectedRegionId: undefined }
    addCampaignCommand({
      focus: { execute: focus, undo: focus, redo: focus },
      execute: async () => await write(after),
      undo: async () => await write(before)
    }).catch((error: unknown) => reportFailure(error))
  }

  return { addBlockOrder }
}
