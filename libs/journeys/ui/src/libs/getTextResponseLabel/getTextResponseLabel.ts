import { TreeBlock } from '../../libs/block'
import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../libs/block/__generated__/BlockFields'

function flatten(children: TreeBlock[]): TreeBlock[] {
  return children.reduce<TreeBlock[]>(
    (result, item) => [...result, item, ...flatten(item.children)],
    []
  )
}

export function getTextResponseLabel(
  children: TreeBlock[],
  blockId: string
): string | null {
  const descendants = flatten(children)
  const matchingTextResponseBlock = descendants.find((block) => block.id === blockId)
  
  if (
    matchingTextResponseBlock != null &&
    matchingTextResponseBlock?.__typename === 'TextResponseBlock' &&
    matchingTextResponseBlock?.label.trim() !== ''
  ) {
    return matchingTextResponseBlock.label
  }
  return null
}
