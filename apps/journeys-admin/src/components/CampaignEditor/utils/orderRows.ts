import { CampaignBlockOrderUpdate } from '../../../../__generated__/CampaignBlockOrderUpdate'
import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'

/** The siblings' rows, as the order mutation returns them. */
export type OrderRows = CampaignBlockOrderUpdate['campaignBlockOrderUpdate']

/** A sibling's row as the order mutation returns it; an Extra carries its placement. */
function orderRow(
  block: CampaignBlock,
  parentOrder: number
): OrderRows[number] {
  if (
    block.__typename === 'CampaignTypographyBlock' ||
    block.__typename === 'CampaignButtonBlock'
  )
    return {
      __typename: block.__typename,
      id: block.id,
      parentOrder,
      placement: block.placement
    }
  return { __typename: block.__typename, id: block.id, parentOrder }
}

/** The blocks' rows in the given order, numbered from 0, with their placements. */
export function orderRows(blocks: CampaignBlock[]): OrderRows {
  return blocks.map((block, index) => orderRow(block, index))
}
