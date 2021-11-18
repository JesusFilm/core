export type TreeBlock<Block, ChildBlock = Block> = Block & {
  children: Array<TreeBlock<ChildBlock>>
}

export function transformer<Block = Record<string, never>>(
  data: Array<Block & { id: string; parentBlockId: string | null }>
): Array<TreeBlock<Block>> {
  const tree: Array<TreeBlock<Block>> = []
  const childrenOf: Record<string, Array<TreeBlock<Block>> | undefined> = {}
  data.forEach((item) => {
    const newNode: TreeBlock<Block> = {
      ...item,
      children: []
    }
    const { id, parentBlockId } = item
    childrenOf[id] ||= []
    newNode.children = childrenOf[id] as Array<TreeBlock<Block>>
    if (parentBlockId != null) {
      childrenOf[parentBlockId] ||= []
      childrenOf[parentBlockId]?.push(newNode)
    } else {
      tree.push(newNode)
    }
  })
  return tree
}
