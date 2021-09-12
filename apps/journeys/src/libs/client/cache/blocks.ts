import { makeVar, useReactiveVar } from '@apollo/client'
import { useCallback } from 'react'
import { TreeBlock } from '../../transformer/transformer'

export const activeBlockVar = makeVar<TreeBlock | null>(null)
export const treeBlocksVar = makeVar<TreeBlock[]>([])

interface UseBlocksHook {
  setActiveBlockById: (id?: string) => void
  setTreeBlocks: (blocks: TreeBlock[]) => void
  activeBlock: TreeBlock | null
  treeBlocks: TreeBlock[]
}

export function useBlocks (): UseBlocksHook {
  const activeBlock = useReactiveVar(activeBlockVar)
  const treeBlocks = useReactiveVar(treeBlocksVar)

  const setActiveBlockById = useCallback((id?: string): void => {
    const blocks = treeBlocksVar()
    const activeBlockId = activeBlockVar()?.id

    if (id != null) {
      const block = blocks.find((block) => block.id === id)
      if (block != null) {
        activeBlockVar(block)
      }
    } else if (activeBlockId != null) {
      const index = blocks.findIndex((block) => block.id === activeBlockId)
      if (index > -1 && blocks[index + 1] != null) {
        activeBlockVar(blocks[index + 1])
      } else {
        activeBlockVar(null)
      }
    }
  }, [])

  const setTreeBlocks = useCallback((blocks: TreeBlock[]): void => {
    treeBlocksVar(blocks)
    setActiveBlockById(blocks[0]?.id)
  }, [setActiveBlockById])

  return {
    setActiveBlockById,
    setTreeBlocks,
    activeBlock,
    treeBlocks
  }
}
