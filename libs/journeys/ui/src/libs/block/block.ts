import { makeVar, useReactiveVar } from '@apollo/client'
import { useCallback } from 'react'
import { BlockFields_StepBlock as StepFields } from './__generated__/BlockFields'
import type { TreeBlock } from './TreeBlock'

export const blockHistoryVar = makeVar<TreeBlock[]>([])
export const treeBlocksVar = makeVar<TreeBlock[]>([])

interface ActiveBlockArgs {
  /** StepBlock id to set as activeBlock. If no id is set, block will be set to
   *  activeBlock.nextBlockId */
  id?: string
}
interface UseBlocksHook {
  prevActiveBlock: (args?: ActiveBlockArgs) => void
  nextActiveBlock: (args?: ActiveBlockArgs) => void
  setTreeBlocks: (blocks: TreeBlock[]) => void
  treeBlocks: TreeBlock[]
  blockHistory: TreeBlock[]
}

export function prevActiveBlock(args?: ActiveBlockArgs): void {
  const blockHistory = blockHistoryVar()

  const lastBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>

  const updatedBlocks =
    lastBlock.id === args?.id && blockHistory.length > 1
      ? [...blockHistory.slice(0, -1)]
      : blockHistory

  blockHistoryVar(updatedBlocks)
}

export function nextActiveBlock(args?: ActiveBlockArgs): void {
  const blocks = treeBlocksVar()
  const blockHistory = blockHistoryVar()
  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>
  let block: TreeBlock<StepFields> | undefined

  // Set next block from id, nextBlockId or next block in treeBlocks
  if (args?.id != null) {
    block = blocks.find(
      (block) => block.__typename === 'StepBlock' && block.id === args.id
    ) as TreeBlock<StepFields> | undefined
  } else if (activeBlock != null) {
    if (activeBlock.nextBlockId != null) {
      block = blocks.find(
        (block) =>
          block.__typename === 'StepBlock' &&
          block.id === activeBlock.nextBlockId
      ) as TreeBlock<StepFields> | undefined
    } else if (
      activeBlock.parentOrder != null &&
      activeBlock.nextBlockId == null
    ) {
      block = blocks[activeBlock.parentOrder + 1] as
        | TreeBlock<StepFields>
        | undefined
    }
  }
  console.log('block', block)
  if (block != null && block !== activeBlock) {
    blockHistoryVar([...blockHistory, block])
  }
}

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce<TreeBlock[]>(
    (result, item) => [...result, item, ...flatten(item.children)],
    []
  )
}

export function isActiveBlockOrDescendant(blockId: string): boolean {
  const blockHistory = blockHistoryVar()
  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>
  if (activeBlock == null) return false
  if (activeBlock.id === blockId) return true

  const descendants = flatten(activeBlock.children)
  return descendants.some(({ id }) => id === blockId)
}

export function useBlocks(): UseBlocksHook {
  const treeBlocks = useReactiveVar(treeBlocksVar)
  const blockHistory = useReactiveVar(blockHistoryVar)

  const setTreeBlocks = useCallback((blocks: TreeBlock[]): void => {
    treeBlocksVar(blocks)
    nextActiveBlock({ id: blocks[0]?.id })
  }, [])

  return {
    prevActiveBlock,
    nextActiveBlock,
    setTreeBlocks,
    treeBlocks,
    blockHistory
  }
}
