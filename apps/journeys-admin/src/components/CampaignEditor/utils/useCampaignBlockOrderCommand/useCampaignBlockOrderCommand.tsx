import sortBy from 'lodash/sortBy'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { CampaignBlockOrderUpdate } from '../../../../../__generated__/CampaignBlockOrderUpdate'
import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { CampaignChildPlacement } from '../../../../../__generated__/globalTypes'
import { useCampaignBlockOrderUpdateMutation } from '../../../../libs/useCampaignBlockOrderUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { siblingsOf } from '../useCampaignBlockDeleteCommand'

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

interface OrderParameters {
  parentOrder: number
  placement?: CampaignChildPlacement | null
  rows: OrderRows
}

/**
 * Moving a block is one Command: execute focuses the block and writes the
 * new position (and, for an Extra crossing the Section Body, its placement)
 * with the renumbered siblings shown at once; undo writes the position and
 * placement it had back through the same mutation.
 */
export function useCampaignBlockOrderCommand(): {
  addBlockOrder: (
    block: CampaignBlock,
    parentOrder: number,
    placement?: CampaignChildPlacement | null
  ) => void
} {
  const { add } = useCommand()
  const {
    campaign,
    state: { pageKind },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const [orderUpdate] = useCampaignBlockOrderUpdateMutation()

  function addBlockOrder(
    block: CampaignBlock,
    parentOrder: number,
    placement?: CampaignChildPlacement | null
  ): void {
    if (block.parentOrder == null) return
    const blockPageKind = pageKindOf(block) ?? pageKind
    const before: OrderParameters = {
      parentOrder: block.parentOrder,
      placement: 'placement' in block ? block.placement : undefined,
      rows: currentSiblings(campaign.blocks, block)
    }
    const after: OrderParameters = {
      parentOrder,
      placement,
      rows: reorderedSiblings(campaign.blocks, block, parentOrder, placement)
    }

    add<OrderParameters>({
      parameters: { execute: after, undo: before },
      execute({
        parentOrder: nextParentOrder,
        placement: nextPlacement,
        rows
      }) {
        dispatch({
          type: 'SetEditorFocusAction',
          pageKind: blockPageKind,
          selectedBlockId: block.id
        })
        void orderUpdate({
          variables: {
            id: block.id,
            parentOrder: nextParentOrder,
            ...(nextPlacement != null ? { placement: nextPlacement } : {})
          },
          optimisticResponse: { campaignBlockOrderUpdate: rows }
        })
      }
    })
  }

  return { addBlockOrder }
}
