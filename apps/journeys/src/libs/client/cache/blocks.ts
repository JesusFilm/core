import { makeVar, useReactiveVar } from '@apollo/client'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'
import { useCallback } from 'react'
import { TreeBlock } from '../../transformer/transformer'

export const activeBlockVar = makeVar<TreeBlock<StepBlock> | null>(null)
export const treeBlocksVar = makeVar<TreeBlock[]>([])

interface NextActiveBlockArgs {
  /** StepBlock id to set as activeBlock. If no id is set, block will be set to
   *  activeBlock.nextBlockId */
  id?: string
}
interface UseBlocksHook {
  nextActiveBlock: (args?: NextActiveBlockArgs) => void
  setTreeBlocks: (blocks: TreeBlock[]) => void
  activeBlock: TreeBlock<StepBlock> | null
  treeBlocks: TreeBlock[]
}

export function nextActiveBlock(args?: NextActiveBlockArgs): void {
  const blocks = treeBlocksVar()
  const activeBlock = activeBlockVar()
  let block: TreeBlock<StepBlock> | undefined
  if (args?.id != null) {
    block = blocks.find(
      (block) => block.__typename === 'StepBlock' && block.id === args.id
    ) as TreeBlock<StepBlock> | undefined
  } else if (activeBlock != null) {
    block = blocks.find(
      (block) =>
        block.__typename === 'StepBlock' && block.id === activeBlock.nextBlockId
    ) as TreeBlock<StepBlock> | undefined
  }
  if (block != null) {
    activeBlockVar(block)
  }
}

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce(
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

  const setTreeBlocks = useCallback((blocks: TreeBlock[]): void => {
    treeBlocksVar(blocks)
    activeBlockVar(null)
    nextActiveBlock({ id: blocks[0]?.id })
  }, [])

  return {
    nextActiveBlock,
    setTreeBlocks,
    activeBlock,
    treeBlocks
  }
}
