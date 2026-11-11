import sortBy from 'lodash/sortBy'
import { v4 as uuidv4 } from 'uuid'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { useCampaignBlockDuplicateMutation } from '../../../../libs/useCampaignBlockDuplicateMutation'
import { blockColumn } from '../../../../libs/useCampaignBlockTextMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { siblingRows, siblingsOf } from '../siblingsOf'
import { SLOT_COLUMNS, subtreeOf } from '../subtreeOf'
import { useCampaignBlockSoftDelete } from '../useCampaignBlockSoftDelete'
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
  const remap = (id: string): string => ids.get(id) ?? id
  const copies = subtree.map((row): CampaignBlock => {
    const copy: CampaignBlock = {
      ...row,
      id: remap(row.id),
      parentBlockId:
        row.id === block.id || row.parentBlockId == null
          ? row.parentBlockId
          : remap(row.parentBlockId),
      parentOrder:
        row.id === block.id ? (block.parentOrder ?? 0) + 1 : row.parentOrder
    }
    for (const column of SLOT_COLUMNS) {
      const owned = blockColumn(copy, column)
      if (typeof owned === 'string') Reflect.set(copy, column, remap(owned))
    }
    if (copy.__typename !== 'CampaignButtonBlock' || copy.action == null)
      return copy
    const action =
      copy.action.__typename === 'CampaignScrollToBlockAction'
        ? { ...copy.action, blockId: remap(copy.action.blockId) }
        : copy.action
    return { ...copy, action: { ...action, parentBlockId: copy.id } }
  })
  const siblings = sortBy([...siblingsOf(blocks, block), block], 'parentOrder')
  const original = siblings.findIndex((sibling) => sibling.id === block.id)
  siblings.splice(original + 1, 0, copies[0])
  return {
    copies,
    idMap: subtree.map((row) => ({
      oldId: row.id,
      newId: remap(row.id)
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
  const { softDelete, restore } = useCampaignBlockSoftDelete()
  const reportFailure = useCommandFailure()

  function addBlockDuplicate(block: CampaignBlock): void {
    if (block.parentOrder == null) return
    const { copies, idMap, siblingsAfter } = duplicateBlocks(
      campaign.blocks,
      block
    )
    const copy = copies[0]
    const subtreeAfter = [...siblingsAfter, ...copies.slice(1)]
    const siblingsBefore = siblingRows(
      sortBy([...siblingsOf(campaign.blocks, block), block], 'parentOrder')
    )
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
      undo: async () => await softDelete(copy, siblingsBefore),
      redo: async () => await restore(copy, subtreeAfter)
    }).catch((error: unknown) => reportFailure(error))
  }

  return { addBlockDuplicate }
}
