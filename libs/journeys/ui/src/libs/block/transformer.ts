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
  return tree.filter(({ __typename: typename }) => typename === 'StepBlock')
}
