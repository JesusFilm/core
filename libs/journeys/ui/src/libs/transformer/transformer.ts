import { GetJourney_journey_blocks as Block } from './__generated__/GetJourney'

export type TreeBlock<T = Block> = T & {
  children: TreeBlock[]
}

export default function transformer(data: Block[]): TreeBlock[] {
  const tree: TreeBlock[] = []
  const childrenOf: Record<string, TreeBlock[] | undefined> = {}
  data.forEach((item) => {
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
