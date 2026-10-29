import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { siblingRows, siblingsOf } from '../siblingsOf'
import { useCampaignBlockSoftDelete } from '../useCampaignBlockSoftDelete'
import { CampaignCommandFocus, useCampaignCommand } from '../useCampaignCommand'
import { useCommandFailure } from '../useCommandFailure'

/** What execute and redo select in place of the block's parent. */
export type CampaignBlockDeleteFocus = Pick<
  CampaignCommandFocus,
  'selectedBlockId' | 'selectedRegionId'
>

/**
 * Deleting a block is one Command with no confirmation: execute selects the
 * host (or `focus`, when given) and soft-deletes the block, showing the renumbered siblings at once,
 * after sending the text edits of its whole subtree still waiting on their
 * debounce; undo selects the block on the page it was on and restores it
 * through `campaignBlockRestore`, with the block and its siblings as the
 * optimistic response so it reappears in place.
 */
export function useCampaignBlockDeleteCommand(): {
  addBlockDelete: (
    block: CampaignBlock,
    focus?: CampaignBlockDeleteFocus
  ) => void
} {
  const { addCampaignCommand } = useCampaignCommand()
  const { campaign } = useCampaignEditor()
  const { softDelete, restore } = useCampaignBlockSoftDelete()
  const reportFailure = useCommandFailure()

  function addBlockDelete(
    block: CampaignBlock,
    focus?: CampaignBlockDeleteFocus
  ): void {
    const siblingsBefore = siblingsOf(campaign.blocks, block)
    const siblingsAfter = siblingRows(siblingsBefore)
    const selectHost = {
      selectedBlockId:
        focus?.selectedBlockId ?? block.parentBlockId ?? undefined,
      selectedRegionId: focus?.selectedRegionId
    }

    addCampaignCommand({
      flush: block,
      focus: {
        execute: selectHost,
        undo: { selectedBlockId: block.id, selectedRegionId: undefined },
        redo: selectHost
      },
      execute: async (step) => await softDelete(block, siblingsAfter, step),
      undo: async () => await restore(block, [block, ...siblingsBefore])
    }).catch((error: unknown) => reportFailure(error))
  }

  return { addBlockDelete }
}
