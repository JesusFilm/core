import sortBy from 'lodash/sortBy'
import { v4 as uuidv4 } from 'uuid'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { useCampaignBlockDeleteMutation } from '../../../../libs/useCampaignBlockDeleteMutation'
import { useCampaignBlockDuplicateMutation } from '../../../../libs/useCampaignBlockDuplicateMutation'
import { useCampaignBlockRestoreMutation } from '../../../../libs/useCampaignBlockRestoreMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { SLOT_COLUMNS, subtreeOf } from '../subtreeOf'
import { siblingsOf } from '../useCampaignBlockDeleteCommand'
import { useCampaignCommand } from '../useCampaignCommand'
import { useCommandFailure } from '../useCommandFailure'

export interface CampaignBlockIdMap {
  oldId: string
  newId: string
}

export interface CampaignDuplicate {
  /** The copy, root first, then its descendants, under new ids. */
  copies: CampaignBlock[]
  idMap: CampaignBlockIdMap[]
  /** The original's siblings with the copy inserted after it, renumbered. */
  siblingsAfter: CampaignBlock[]
}

/**
 * The copy as `campaignBlockDuplicate` returns it, built from the cached
 * blocks so it can show before the response arrives: the subtree under new
 * ids with parent, slot and action references remapped, the root directly
 * after the original, and the siblings renumbered around it.
 */
export function duplicateBlocks(
  blocks: CampaignBlock[],
  block: CampaignBlock,
  newId: () => string = uuidv4
): CampaignDuplicate {
  const subtree = subtreeOf(blocks, block.id)
  const ids = new Map(subtree.map((row) => [row.id, newId()]))
  const remap = (id: unknown): unknown =>
    typeof id === 'string' ? (ids.get(id) ?? id) : id
  const copies = subtree.map((row) => {
    const copy: Record<string, unknown> = {
      ...row,
      id: ids.get(row.id),
      parentBlockId:
        row.id === block.id ? row.parentBlockId : remap(row.parentBlockId),
      parentOrder:
        row.id === block.id ? (block.parentOrder ?? 0) + 1 : row.parentOrder
    }
    for (const column of SLOT_COLUMNS)
      if (column in copy) copy[column] = remap(copy[column])
    const action = copy.action as Record<string, unknown> | null | undefined
    if (action != null)
      copy.action = {
        ...action,
        parentBlockId: copy.id,
        ...('blockId' in action ? { blockId: remap(action.blockId) } : {})
      }
    return copy as unknown as CampaignBlock
  })
  const siblings = sortBy([...siblingsOf(blocks, block), block], 'parentOrder')
  const original = siblings.findIndex((sibling) => sibling.id === block.id)
  siblings.splice(original + 1, 0, copies[0])
  return {
    copies,
    idMap: subtree.map((row) => ({
      oldId: row.id,
      newId: ids.get(row.id) as string
    })),
    siblingsAfter: siblings.map((sibling, parentOrder) => ({
      ...sibling,
      parentOrder
    }))
  }
}

/**
 * Duplicating a block is one Command: execute selects the copy and runs the
 * duplicate with the whole copied subtree shown at once; undo reselects the
 * original and soft-deletes the copy's root (its descendants fall out of the
 * tree with it); redo restores the root, which brings them back. The text
 * edits of the whole subtree still waiting on their debounce are sent first,
 * so the copy is never made from stale text. When the duplicate is refused
 * the copy never existed, so undo has nothing to delete and redo runs the
 * duplicate again instead of restoring it.
 */
export function useCampaignBlockDuplicateCommand(): {
  addBlockDuplicate: (block: CampaignBlock) => void
} {
  const { addCampaignCommand } = useCampaignCommand()
  const { campaign } = useCampaignEditor()
  const [duplicate] = useCampaignBlockDuplicateMutation(campaign.id)
  const [blockDelete] = useCampaignBlockDeleteMutation(campaign.id)
  const [blockRestore] = useCampaignBlockRestoreMutation(campaign.id)
  const reportFailure = useCommandFailure()

  function addBlockDuplicate(block: CampaignBlock): void {
    if (block.parentOrder == null) return
    const { copies, idMap, siblingsAfter } = duplicateBlocks(
      campaign.blocks,
      block
    )
    const copy = copies[0]
    const subtreeAfter = [...siblingsAfter, ...copies.slice(1)]
    const siblingsBefore = sortBy(
      [...siblingsOf(campaign.blocks, block), block],
      'parentOrder'
    ).map((sibling) => ({
      __typename: sibling.__typename,
      id: sibling.id,
      parentOrder: sibling.parentOrder
    }))
    const selectCopy = { selectedBlockId: copy.id, selectedRegionId: undefined }

    addCampaignCommand({
      flush: block,
      focus: {
        execute: selectCopy,
        undo: { selectedBlockId: block.id, selectedRegionId: undefined },
        redo: selectCopy
      },
      execute: async ({ flushContext }) =>
        await duplicate({
          variables: { id: block.id, idMap },
          optimisticResponse: { campaignBlockDuplicate: subtreeAfter },
          context: flushContext
        }),
      undo: async () =>
        await blockDelete({
          variables: { id: copy.id },
          optimisticResponse: { campaignBlockDelete: siblingsBefore }
        }),
      redo: async () =>
        await blockRestore({
          variables: { id: copy.id },
          optimisticResponse: { campaignBlockRestore: subtreeAfter }
        })
    }).catch((error: unknown) => reportFailure(error))
  }

  return { addBlockDuplicate }
}
