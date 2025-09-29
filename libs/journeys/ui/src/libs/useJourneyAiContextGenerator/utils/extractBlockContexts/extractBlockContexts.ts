import { extractBlockContext } from '../../../../components/AiChat/utils/contextExtraction'
import { TreeBlock } from '../../../block'

export function extractBlockContexts(treeBlocks: TreeBlock[]) {
  return treeBlocks.map((block) => ({
    blockId: block.id,
    contextText: extractBlockContext(block)
  }))
}
