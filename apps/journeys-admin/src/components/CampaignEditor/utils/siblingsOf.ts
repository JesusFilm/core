import sortBy from 'lodash/sortBy'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'
import { CampaignBlockOrder } from '../../../libs/campaignBlockCache'

/** A block's key row, as the delete, restore and order mutations return its siblings. */
export type CampaignSiblingRow = CampaignBlockOrder &
  Pick<CampaignBlock, '__typename'> & { parentOrder: number }

/** A block's live, ordered siblings, excluding itself. */
export function siblingsOf(
  blocks: CampaignBlock[],
  block: CampaignBlock
): CampaignBlock[] {
  return sortBy(
    blocks.filter(
      (candidate) =>
        candidate.id !== block.id &&
        candidate.parentOrder != null &&
        candidate.parentBlockId === block.parentBlockId &&
        candidate.pageId === block.pageId &&
        candidate.regionId === block.regionId
    ),
    'parentOrder'
  )
}

/** The blocks' key rows in the given order, numbered contiguously from 0. */
export function siblingRows(blocks: CampaignBlock[]): CampaignSiblingRow[] {
  return blocks.map((block, parentOrder) => ({
    __typename: block.__typename,
    id: block.id,
    parentOrder
  }))
}
