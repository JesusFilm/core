import sortBy from 'lodash/sortBy'

import type { BlockFields } from './__generated__/BlockFields'
import type { TreeBlock } from './TreeBlock'

export function transformer(data: BlockFields[]): TreeBlock[] {
  const tree: TreeBlock[] = []
  const childrenOf: Record<string, TreeBlock[] | undefined> = {}
  const sortedData = sortBy(data, 'parentOrder')
  sortedData.forEach((item) => {
    const newNode: TreeBlock = {
      ...item,
      children: []
    }
    const { id, parentBlockId } = item
    childrenOf[id] ||= []
    newNode.children = childrenOf[id]
    if (parentBlockId != null) {
      childrenOf[parentBlockId] ||= []
      childrenOf[parentBlockId]?.push(newNode)
    } else {
      tree.push(newNode)
    }
  })
  // Persisted Step ranks can have deletion gaps. Rendered Steps use visible
  // ordinals so first-Step and next-Step controls keep their normal behavior.
  let visibleOrder = 0
  return tree
    .filter(({ __typename: typename }) => typename === 'StepBlock')
    .map((step) =>
      step.parentOrder == null ? step : { ...step, parentOrder: visibleOrder++ }
    )
}
