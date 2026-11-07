import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'
import { CampaignChildPlacement } from '../../../../__generated__/globalTypes'

import { OrderRows, orderRows } from './orderRows'
import { siblingsOf } from './siblingsOf'

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
