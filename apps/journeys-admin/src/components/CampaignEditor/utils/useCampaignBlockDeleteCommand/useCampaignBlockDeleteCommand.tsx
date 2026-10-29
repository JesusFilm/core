import sortBy from 'lodash/sortBy'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { useCampaignBlockDeleteMutation } from '../../../../libs/useCampaignBlockDeleteMutation'
import { useCampaignBlockRestoreMutation } from '../../../../libs/useCampaignBlockRestoreMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { useCampaignCommand } from '../useCampaignCommand'
import { useCommandFailure } from '../useCommandFailure'

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

/**
 * Deleting a block is one Command with no confirmation: execute selects the
 * host and soft-deletes the block, showing the renumbered siblings at once,
 * after sending the text edits of its whole subtree still waiting on their
 * debounce; undo selects the block on the page it was on and restores it
 * through `campaignBlockRestore`, with the block and its siblings as the
 * optimistic response so it reappears in place.
 */
export function useCampaignBlockDeleteCommand(): {
  addBlockDelete: (block: CampaignBlock) => void
} {
  const { addCampaignCommand } = useCampaignCommand()
  const { campaign } = useCampaignEditor()
  const [blockDelete] = useCampaignBlockDeleteMutation(campaign.id)
  const [blockRestore] = useCampaignBlockRestoreMutation(campaign.id)
  const reportFailure = useCommandFailure()

  function addBlockDelete(block: CampaignBlock): void {
    const siblingsBefore = siblingsOf(campaign.blocks, block)
    const siblingsAfter = siblingsBefore.map((sibling, parentOrder) => ({
      __typename: sibling.__typename,
      id: sibling.id,
      parentOrder
    }))
    const selectHost = {
      selectedBlockId: block.parentBlockId ?? undefined,
      selectedRegionId: undefined
    }

    addCampaignCommand({
      flush: block,
      focus: {
        execute: selectHost,
        undo: { selectedBlockId: block.id, selectedRegionId: undefined },
        redo: selectHost
      },
      execute: async ({ flushContext }) =>
        await blockDelete({
          variables: { id: block.id },
          optimisticResponse: { campaignBlockDelete: siblingsAfter },
          context: flushContext
        }),
      undo: async () =>
        await blockRestore({
          variables: { id: block.id },
          optimisticResponse: {
            campaignBlockRestore: [block, ...siblingsBefore]
          }
        })
    }).catch((error: unknown) => reportFailure(error))
  }

  return { addBlockDelete }
}
