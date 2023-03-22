import { makeVar, useReactiveVar } from '@apollo/client'
import { useCallback } from 'react'
import { BlockFields_StepBlock as StepFields } from './__generated__/BlockFields'
import type { TreeBlock } from './TreeBlock'

export const activeBlockVar = makeVar<TreeBlock<StepFields> | null>(null)
export const previousBlocksVar = makeVar<TreeBlock[]>([])
export const treeBlocksVar = makeVar<TreeBlock[]>([])

interface NextActiveBlockArgs {
  /** StepBlock id to set as activeBlock. If no id is set, block will be set to
   *  activeBlock.nextBlockId */
  id?: string
}
interface UseBlocksHook {
  nextActiveBlock: (args?: NextActiveBlockArgs) => void
  setActiveBlock: (block: TreeBlock<StepFields>) => void
  setTreeBlocks: (blocks: TreeBlock[]) => void
  activeBlock: TreeBlock<StepFields> | null
  treeBlocks: TreeBlock[]
  previousBlocks: TreeBlock[]
}

export function setActiveBlock(block: TreeBlock<StepFields>): void {
  activeBlockVar(block)
}

export function nextActiveBlock(args?: NextActiveBlockArgs): void {
  const blocks = treeBlocksVar()
  const activeBlock = activeBlockVar()
  let block: TreeBlock<StepFields> | undefined
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
    if (activeBlock != null) {
      previousBlocksVar([...previousBlocksVar(), activeBlock])
    }
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
  // console.log('isActiveBlockOrDescendant', activeBlock, blockId)
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
    nextActiveBlock,
    setActiveBlock,
    setTreeBlocks,
    activeBlock,
    treeBlocks,
    previousBlocks
  }
}
