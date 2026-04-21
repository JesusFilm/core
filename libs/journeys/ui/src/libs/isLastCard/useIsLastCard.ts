import { useBlocks } from '../block'

import type { TreeBlock } from '../block'
import type { BlockFields_StepBlock as StepFields } from '../block/__generated__/BlockFields'

export function useIsLastCard(): boolean {
  const { blockHistory, getNextBlock, treeBlocks } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1] as
    | TreeBlock<StepFields>
    | undefined
  if (activeBlock == null || treeBlocks.length === 0) return false
  return getNextBlock({ activeBlock }) === undefined
}
