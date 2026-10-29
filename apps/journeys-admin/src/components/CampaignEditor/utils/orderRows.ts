import { CampaignBlockOrderUpdate } from '../../../../__generated__/CampaignBlockOrderUpdate'
import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'
import { CampaignChildPlacement } from '../../../../__generated__/globalTypes'
import { CampaignBlockOrder } from '../../../libs/campaignBlockCache'

import { siblingRows } from './siblingsOf'

/** The siblings' rows, as the order mutation returns them. */
export type OrderRows = CampaignBlockOrderUpdate['campaignBlockOrderUpdate']

/** A sibling's row as the order mutation returns it; an Extra carries its placement. */
type OrderRow = CampaignBlockOrder & {
  placement?: CampaignChildPlacement | null
}

/** The blocks' rows in the given order, numbered from 0, with their placements. */
export function orderRows(blocks: CampaignBlock[]): OrderRows {
  const rows: OrderRow[] = siblingRows(blocks).map((row, index) => {
    const block = blocks[index]
    return 'placement' in block ? { ...row, placement: block.placement } : row
  })
  return rows as unknown as OrderRows
}
