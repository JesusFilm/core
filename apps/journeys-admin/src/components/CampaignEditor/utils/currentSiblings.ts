import sortBy from 'lodash/sortBy'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'

import { OrderRows, orderRows } from './orderRows'
import { siblingsOf } from './siblingsOf'

/** A block's siblings and itself in their current order, as the order mutation returns them. */
export function currentSiblings(
  blocks: CampaignBlock[],
  block: CampaignBlock
): OrderRows {
  return orderRows(sortBy([...siblingsOf(blocks, block), block], 'parentOrder'))
}
