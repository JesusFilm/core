import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { CampaignChildPlacement } from '../../../../../__generated__/globalTypes'
import { useCampaignBlockOrderUpdateMutation } from '../../../../libs/useCampaignBlockOrderUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { currentSiblings } from '../currentSiblings'
import { reorderedSiblings } from '../reorderedSiblings'
import { useCampaignCommand } from '../useCampaignCommand'
import { useCommandFailure } from '../useCommandFailure'

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
