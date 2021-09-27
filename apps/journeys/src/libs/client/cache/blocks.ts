import { makeVar, useReactiveVar } from '@apollo/client'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'
import { useCallback } from 'react'
import { TreeBlock } from '../../transformer/transformer'

export const activeBlockVar = makeVar<TreeBlock<StepBlock> | null>(null)
export const treeBlocksVar = makeVar<TreeBlock[]>([])

interface nextActiveBlockArgs {
  /** StepBlock id to set as activeBlock. If no id is set, block will be set to
   *  activeBlock.nextBlockId */
  id?: string
}

interface UseBlocksHook {
  nextActiveBlock: (args?: nextActiveBlockArgs) => void
  setTreeBlocks: (blocks: TreeBlock[]) => void
  activeBlock: TreeBlock<StepBlock> | null
  treeBlocks: TreeBlock[]
}

export function useBlocks(): UseBlocksHook {
  const activeBlock = useReactiveVar(activeBlockVar)
  const treeBlocks = useReactiveVar(treeBlocksVar)

  const nextActiveBlock = useCallback((args?: nextActiveBlockArgs): void => {
    const blocks = treeBlocksVar()
    const activeBlock = activeBlockVar()
    let block: TreeBlock<StepBlock> | undefined
    if (args?.id != null) {
      block = blocks.find(
        (block) => block.__typename === 'StepBlock' && block.id === args.id
      ) as TreeBlock<StepBlock> | undefined
    } else if (activeBlock != null && activeBlock.__typename === 'StepBlock') {
      block = blocks.find(
        (block) =>
          block.__typename === 'StepBlock' &&
          block.id === activeBlock.nextBlockId
      ) as TreeBlock<StepBlock> | undefined
    }
    if (block != null) {
      activeBlockVar(block)
    }
  }, [])

  const setTreeBlocks = useCallback(
    (blocks: TreeBlock[]): void => {
      treeBlocksVar(blocks)
      activeBlockVar(null)
      nextActiveBlock({ id: blocks[0]?.id })
    },
    [nextActiveBlock]
  )

  return {
    nextActiveBlock,
    setTreeBlocks,
    activeBlock,
    treeBlocks
  }
}
