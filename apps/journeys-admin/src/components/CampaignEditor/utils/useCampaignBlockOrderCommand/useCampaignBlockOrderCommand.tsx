import { useApolloClient } from '@apollo/client/react'
import { useRef } from 'react'

import {
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign
} from '../../../../../__generated__/GetCampaign'
import { CampaignChildPlacement } from '../../../../../__generated__/globalTypes'
import { useCampaignBlockOrderUpdateMutation } from '../../../../libs/useCampaignBlockOrderUpdateMutation'
import { GET_CAMPAIGN } from '../../../../libs/useCampaignQuery'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { reorderedSiblings } from '../reorderedSiblings'
import { useCampaignCommand } from '../useCampaignCommand'
import { useCommandFailure } from '../useCommandFailure'

/**
 * Moving a block is one Command: execute writes the new position (and, for
 * an Extra crossing the Section Body, its placement) with the renumbered
 * siblings shown at once; undo restores the position and placement held at
 * first execution. Each step reads the current siblings for its optimistic
 * rows. Every step selects the block, or `focusBlockId`
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
  const campaignRef = useRef(campaign)
  campaignRef.current = campaign
  const { cache } = useApolloClient()
  const [orderUpdate] = useCampaignBlockOrderUpdateMutation()
  const reportFailure = useCommandFailure()

  function addBlockOrder(
    block: CampaignBlock,
    parentOrder: number,
    placement?: CampaignChildPlacement | null,
    focusBlockId: string = block.id
  ): void {
    if (block.parentOrder == null) return
    let before:
      | { parentOrder: number; placement?: CampaignChildPlacement | null }
      | undefined

    function currentBlocks(): CampaignBlock[] {
      return (
        cache.readQuery<GetCampaign>({
          query: GET_CAMPAIGN,
          variables: { id: campaign.id },
          optimistic: true
        })?.campaign ?? campaignRef.current
      ).blocks
    }

    async function write(
      nextParentOrder: number,
      nextPlacement?: CampaignChildPlacement | null
    ): Promise<unknown> {
      const blocks = currentBlocks()
      const current =
        blocks.find((candidate) => candidate.id === block.id) ?? block
      return await orderUpdate({
        variables: {
          id: block.id,
          parentOrder: nextParentOrder,
          ...(nextPlacement != null ? { placement: nextPlacement } : {})
        },
        optimisticResponse: {
          campaignBlockOrderUpdate: reorderedSiblings(
            blocks,
            current,
            nextParentOrder,
            nextPlacement
          )
        }
      })
    }

    const focus = { selectedBlockId: focusBlockId, selectedRegionId: undefined }
    addCampaignCommand({
      focus: { execute: focus, undo: focus, redo: focus },
      async execute() {
        const current =
          currentBlocks().find((candidate) => candidate.id === block.id) ??
          block
        if (current.parentOrder == null) return
        before ??= {
          parentOrder: current.parentOrder,
          placement: 'placement' in current ? current.placement : undefined
        }
        return await write(parentOrder, placement)
      },
      async undo() {
        if (before == null) return
        return await write(before.parentOrder, before.placement)
      }
    }).catch((error: unknown) => reportFailure(error))
  }

  return { addBlockOrder }
}
