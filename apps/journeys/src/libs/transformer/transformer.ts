type Node<T> = T & {
    children: Node<T>[]
  }
  
  interface Item {
    id: string
    parentId?: string
  }
  
  export default function transformer<T extends Item>(data: T[]): Node<T>[] {
    const tree: Node<T>[] = []
    const childrenOf: Record<string, Node<T>[]> = {}
    data.forEach((item) => {
      const newNode: Node<T> = {
        ...item,
        children: []
      }
      const { id, parentId } = item
      childrenOf[id] = childrenOf[id] || []
      newNode.children = childrenOf[id]
      parentId
        ? (childrenOf[parentId] = childrenOf[parentId] || []).push(newNode)
        : tree.push(newNode)
    })
    return tree
  }
  