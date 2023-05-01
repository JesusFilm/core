import { makeVar, useReactiveVar } from '@apollo/client'
import { useCallback } from 'react'
import { BlockFields_StepBlock as StepFields } from './__generated__/BlockFields'
import type { TreeBlock } from './TreeBlock'

export const activeBlockVar = makeVar<TreeBlock<StepFields> | null>(null)
export const previousBlocksVar = makeVar<TreeBlock[]>([])
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
  activeBlock: TreeBlock<StepFields> | null
  treeBlocks: TreeBlock[]
  previousBlocks: TreeBlock[]
}

export function prevActiveBlock(): void {
  const blocks = treeBlocksVar()
  const previousBlocks = previousBlocksVar()
  const updatedBlocks = previousBlocksVar([...previousBlocks.slice(0, -1)])

  // Use prev block in history else use first block in tree
  if (updatedBlocks.length > 0) {
    activeBlockVar(
      updatedBlocks[updatedBlocks.length - 1] as TreeBlock<StepFields>
    )
  } else {
    activeBlockVar(blocks[0] as TreeBlock<StepFields>)
  }
}

export function nextActiveBlock(args?: ActiveBlockArgs, src?: string): void {
  const blocks = treeBlocksVar()
  const activeBlock = activeBlockVar()
  const previousBlocks = previousBlocksVar()
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
  if (block != null) {
    previousBlocksVar([...previousBlocks, block])
    activeBlockVar(block)
  }
}

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce<TreeBlock[]>(
    (result, item) => [...result, item, ...flatten(item.children)],
    []
  )
}

export function isActiveBlockOrDescendant(blockId: string): boolean {
  const activeBlock = activeBlockVar()
  if (activeBlock == null) return false
  if (activeBlock.id === blockId) return true

  const descendants = flatten(activeBlock.children)
  return descendants.some(({ id }) => id === blockId)
}

export function useBlocks(): UseBlocksHook {
  const activeBlock = useReactiveVar(activeBlockVar)
  const treeBlocks = useReactiveVar(treeBlocksVar)
  const previousBlocks = useReactiveVar(previousBlocksVar)

  const setTreeBlocks = useCallback((blocks: TreeBlock[]): void => {
    treeBlocksVar(blocks)
    activeBlockVar(null)
    nextActiveBlock({ id: blocks[0]?.id })
  }, [])

  return {
    prevActiveBlock,
    nextActiveBlock,
    setTreeBlocks,
    activeBlock,
    treeBlocks,
    previousBlocks
  }
}
