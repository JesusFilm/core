import { makeVar, useReactiveVar } from '@apollo/client'
import { useCallback } from 'react'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../transformer/transformer'

const activeBlockVar = makeVar<TreeBlock<StepBlock> | null>(null)
const previousBlocksVar = makeVar<TreeBlock[]>([])
const treeBlocksVar = makeVar<TreeBlock[]>([])

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
  previousBlocks: TreeBlock[]
}

function nextActiveBlock(args?: NextActiveBlockArgs): void {
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
    if (activeBlock != null) {
      previousBlocksVar([...previousBlocksVar(), activeBlock])
    }
    activeBlockVar(block)
  }
}

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce(
    (result, item) => [...result, item, ...flatten(item.children)],
    []
  )
}

function isActiveBlockOrDescendant(blockId: string): boolean {
  const activeBlock = activeBlockVar()
  if (activeBlock == null) return false
  if (activeBlock.id === blockId) return true

  const descendants = flatten(activeBlock.children)
  return descendants.some(({ id }) => id === blockId)
}

function useBlocks(): UseBlocksHook {
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
    setTreeBlocks,
    activeBlock,
    treeBlocks,
    previousBlocks
  }
}

export {
  nextActiveBlock,
  isActiveBlockOrDescendant,
  useBlocks,
  activeBlockVar,
  previousBlocksVar,
  treeBlocksVar
}
