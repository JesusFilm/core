import { makeVar, useReactiveVar } from '@apollo/client'
import { StepFields } from '../../components/Step/__generated__/StepFields'
import { useCallback } from 'react'
import { TreeBlock } from '..'

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
  setTreeBlocks: (blocks: TreeBlock[]) => void
  activeBlock: TreeBlock<StepFields> | null
  treeBlocks: TreeBlock[]
  previousBlocks: TreeBlock[]
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
    block = blocks.find(
      (block) =>
        block.__typename === 'StepBlock' && block.id === activeBlock.nextBlockId
    ) as TreeBlock<StepFields> | undefined
  }
  if (block != null) {
    if (activeBlock != null) {
      previousBlocksVar([...previousBlocksVar(), activeBlock])
    }
    activeBlockVar(block)
  }
}

function flatten(children: TreeBlock[]): TreeBlock[] {
  return (children).reduce<TreeBlock[]>(
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
    nextActiveBlock,
    setTreeBlocks,
    activeBlock,
    treeBlocks,
    previousBlocks
  }
}
