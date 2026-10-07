import sortBy from 'lodash/sortBy'
import { v4 as uuidv4 } from 'uuid'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { useCampaignBlockDeleteMutation } from '../../../../libs/useCampaignBlockDeleteMutation'
import { useCampaignBlockDuplicateMutation } from '../../../../libs/useCampaignBlockDuplicateMutation'
import { useCampaignBlockRestoreMutation } from '../../../../libs/useCampaignBlockRestoreMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { siblingsOf } from '../useCampaignBlockDeleteCommand'

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

const SLOT_COLUMNS = ['coverBlockId', 'mediaBlockId', 'logoBlockId'] as const

/** A block and everything it owns, parents first, from the cached list. */
export function subtreeOf(
  blocks: CampaignBlock[],
  rootId: string
): CampaignBlock[] {
  const byId = new Map(blocks.map((block) => [block.id, block]))
  const result: CampaignBlock[] = []
  const seen = new Set<string>()
  const queue = [rootId]
  while (queue.length > 0) {
    const id = queue.shift() as string
    if (seen.has(id)) continue
    const row = byId.get(id)
    if (row == null) continue
    seen.add(id)
    result.push(row)
    const columns = row as unknown as Record<string, unknown>
    for (const column of SLOT_COLUMNS) {
      const owned = columns[column]
      if (typeof owned === 'string') queue.push(owned)
    }
    for (const child of blocks)
      if (child.parentBlockId === id) queue.push(child.id)
  }
  return result
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
 * tree with it); redo restores the root, which brings them back.
 */
export function useCampaignBlockDuplicateCommand(): {
  addBlockDuplicate: (block: CampaignBlock) => void
} {
  const { add } = useCommand()
  const {
    campaign,
    state: { pageKind },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const [duplicate] = useCampaignBlockDuplicateMutation(campaign.id)
  const [blockDelete] = useCampaignBlockDeleteMutation(campaign.id)
  const [blockRestore] = useCampaignBlockRestoreMutation(campaign.id)

  function addBlockDuplicate(block: CampaignBlock): void {
    if (block.parentOrder == null) return
    const blockPageKind = pageKindOf(block) ?? pageKind
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

    function focus(selectedBlockId: string): void {
      dispatch({
        type: 'SetEditorFocusAction',
        pageKind: blockPageKind,
        selectedBlockId
      })
    }

    add({
      parameters: { execute: {}, undo: {} },
      execute() {
        focus(copy.id)
        void duplicate({
          variables: { id: block.id, idMap },
          optimisticResponse: { campaignBlockDuplicate: subtreeAfter }
        })
      },
      undo() {
        focus(block.id)
        void blockDelete({
          variables: { id: copy.id },
          optimisticResponse: { campaignBlockDelete: siblingsBefore }
        })
      },
      redo() {
        focus(copy.id)
        void blockRestore({
          variables: { id: copy.id },
          optimisticResponse: { campaignBlockRestore: subtreeAfter }
        })
      }
    })
  }

  return { addBlockDuplicate }
}
