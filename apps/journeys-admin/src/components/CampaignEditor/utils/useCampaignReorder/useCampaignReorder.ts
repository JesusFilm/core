import {
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_regions as CampaignRegion
} from '../../../../../__generated__/GetCampaign'
import { CampaignChildPlacement } from '../../../../../__generated__/globalTypes'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { slotSection } from '../sectionTypes'
import { useCampaignBlockOrderCommand } from '../useCampaignBlockOrderCommand'
import { useCampaignColumnSwapCommand } from '../useCampaignColumnSwapCommand'
import { useCampaignRegionCommand } from '../useCampaignRegionCommand'

/** What a drop on the canvas or in the Navigator moves. */
export type CampaignReorder =
  | {
      kind: 'block'
      block: CampaignBlock
      parentOrder: number
      /** Set only when an Extra crosses its section's content. */
      placement?: CampaignChildPlacement
    }
  | { kind: 'swap'; slot: CampaignBlock }
  | { kind: 'region'; region: CampaignRegion; order: number }

/**
 * Runs a drop as its one Command: a block's new order, a Column Slot swap
 * (keeping the section in the slot selected) or a region's new order.
 */
export function useCampaignReorder(): (reorder: CampaignReorder) => void {
  const { campaign } = useCampaignEditor()
  const { addBlockOrder } = useCampaignBlockOrderCommand()
  const { addColumnSwap } = useCampaignColumnSwapCommand()
  const { reorderRegion } = useCampaignRegionCommand()

  return function dispatchReorder(reorder: CampaignReorder): void {
    switch (reorder.kind) {
      case 'region':
        reorderRegion(reorder.region, reorder.order)
        return
      case 'swap':
        addColumnSwap(
          reorder.slot,
          slotSection(campaign.blocks, reorder.slot.id)?.id
        )
        return
      case 'block':
        addBlockOrder(reorder.block, reorder.parentOrder, reorder.placement)
    }
  }
}
