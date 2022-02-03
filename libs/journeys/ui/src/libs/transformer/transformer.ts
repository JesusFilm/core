import { sortBy } from 'lodash'
import { BlockFields as Block } from './__generated__/BlockFields'

export type TreeBlock<T = Block> = T & {
  children: TreeBlock[]
}

export function transformer(data: Block[]): TreeBlock[] {
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
    newNode.children = childrenOf[id] as TreeBlock[]
    if (parentBlockId != null) {
      childrenOf[parentBlockId] ||= []
      childrenOf[parentBlockId]?.push(newNode)
    } else {
      tree.push(newNode)
    }
  })
  return tree
}
