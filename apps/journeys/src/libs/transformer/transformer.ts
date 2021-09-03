type Node<T> = T & {
  children: Array<Node<T>>
}

interface Item {
  id: string
  parent?: {
    id: string
  }
}

export default function transformer<T extends Item> (data: T[]): Array<Node<T>> {
  const tree: Array<Node<T>> = []
  const childrenOf: Record<string, Array<Node<T>> | undefined> = {}
  data.forEach((item) => {
    const newNode: Node<T> = {
      ...item,
      children: []
    }
    const { id, parent } = item
    childrenOf[id] ||= []
    newNode.children = childrenOf[id] as Array<Node<T>>
    if (parent != null) {
      childrenOf[parent.id] ||= []
      childrenOf[parent.id]?.push(newNode)
    } else {
      tree.push(newNode)
    }
  })
  return tree
}
