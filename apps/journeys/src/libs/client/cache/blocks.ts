import { makeVar, useReactiveVar } from '@apollo/client'
import { useCallback } from 'react'
import { TreeBlock } from '../../transformer/transformer'

export const activeBlockVar = makeVar<TreeBlock | null>(null)
export const treeBlocksVar = makeVar<TreeBlock[]>([])

interface nextActiveBlockArgs {
  /** StepBlock id to set as activeBlock. If no id is set, block will be set to
   *  activeBlock.nextBlockId */
  id?: string
  /** If no id is set, block will only be set to activeBlock.nextBlockId if
   *  activeBlock.locked is false. Force skips this constraint. */
  force?: boolean
}

interface UseBlocksHook {
  nextActiveBlock: (args: nextActiveBlockArgs) => void
  setTreeBlocks: (blocks: TreeBlock[]) => void
  activeBlock: TreeBlock | null
  treeBlocks: TreeBlock[]
}

export function useBlocks(): UseBlocksHook {
  const activeBlock = useReactiveVar(activeBlockVar)
  const treeBlocks = useReactiveVar(treeBlocksVar)

  const nextActiveBlock = useCallback(
    ({ id, force }: nextActiveBlockArgs): void => {
      const blocks = treeBlocksVar()
      const activeBlock = activeBlockVar()
      let block: TreeBlock | undefined
      if (id != null) {
        block = blocks.find(
          (block) => block.__typename === 'StepBlock' && block.id === id
        )
      } else if (
        activeBlock != null &&
        activeBlock.__typename === 'StepBlock' &&
        (!activeBlock.locked || force === true)
      ) {
        block = blocks.find(
          (block) =>
            block.__typename === 'StepBlock' &&
            block.id === activeBlock.nextBlockId
        )
      }
      if (block != null) {
        activeBlockVar(block)
      }
    },
    []
  )

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
