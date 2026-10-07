import sortBy from 'lodash/sortBy'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { useCampaignBlockDeleteMutation } from '../../../../libs/useCampaignBlockDeleteMutation'
import { useCampaignBlockRestoreMutation } from '../../../../libs/useCampaignBlockRestoreMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { textDebounceKeyPrefix } from '../useCampaignTextCommand'

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
 * host and soft-deletes the block, showing the renumbered siblings at once;
 * undo focuses the page it was on and restores it through
 * `campaignBlockRestore`, with the block and its siblings as the optimistic
 * response so it reappears in place.
 */
export function useCampaignBlockDeleteCommand(): {
  addBlockDelete: (block: CampaignBlock) => void
} {
  const { add } = useCommand()
  const {
    campaign,
    state: { pageKind },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const [blockDelete] = useCampaignBlockDeleteMutation(campaign.id)
  const [blockRestore] = useCampaignBlockRestoreMutation(campaign.id)

  function addBlockDelete(block: CampaignBlock): void {
    const blockPageKind = pageKindOf(block) ?? pageKind
    const siblingsBefore = siblingsOf(campaign.blocks, block)
    const siblingsAfter = siblingsBefore.map((sibling, parentOrder) => ({
      __typename: sibling.__typename,
      id: sibling.id,
      parentOrder
    }))

    add({
      parameters: { execute: {}, undo: {} },
      execute() {
        dispatch({
          type: 'SetEditorFocusAction',
          pageKind: blockPageKind,
          selectedBlockId: block.parentBlockId ?? undefined
        })
        void blockDelete({
          variables: { id: block.id },
          optimisticResponse: { campaignBlockDelete: siblingsAfter },
          context: { debounceFlushPrefix: textDebounceKeyPrefix(block) }
        })
      },
      undo() {
        dispatch({
          type: 'SetEditorFocusAction',
          pageKind: blockPageKind,
          selectedBlockId: block.id
        })
        void blockRestore({
          variables: { id: block.id },
          optimisticResponse: {
            campaignBlockRestore: [block, ...siblingsBefore]
          }
        })
      }
    })
  }

  return { addBlockDelete }
}
