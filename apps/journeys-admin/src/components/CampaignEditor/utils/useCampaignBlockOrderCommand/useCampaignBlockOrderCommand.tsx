import sortBy from 'lodash/sortBy'

import { CampaignBlockOrderUpdate } from '../../../../../__generated__/CampaignBlockOrderUpdate'
import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { CampaignChildPlacement } from '../../../../../__generated__/globalTypes'
import { useCampaignBlockOrderUpdateMutation } from '../../../../libs/useCampaignBlockOrderUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { siblingsOf } from '../useCampaignBlockDeleteCommand'
import { useCampaignCommand } from '../useCampaignCommand'
import { useCommandFailure } from '../useCommandFailure'

type OrderRows = CampaignBlockOrderUpdate['campaignBlockOrderUpdate']

interface OrderRow {
  __typename: CampaignBlock['__typename']
  id: string
  parentOrder: number
  placement?: CampaignChildPlacement | null
}

function orderRow(block: CampaignBlock, parentOrder: number): OrderRow {
  return {
    __typename: block.__typename,
    id: block.id,
    parentOrder,
    ...('placement' in block ? { placement: block.placement } : {})
  }
}

/** A block's siblings and itself in their current order, as the order mutation returns them. */
export function currentSiblings(
  blocks: CampaignBlock[],
  block: CampaignBlock
): OrderRows {
  return sortBy([...siblingsOf(blocks, block), block], 'parentOrder').map(
    (sibling) => orderRow(sibling, sibling.parentOrder ?? 0)
  ) as unknown as OrderRows
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
  return others.map((sibling, index) =>
    orderRow(sibling, index)
  ) as unknown as OrderRows
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
