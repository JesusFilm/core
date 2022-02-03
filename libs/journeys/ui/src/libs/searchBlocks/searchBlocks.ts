import { TreeBlock } from '..'

export function searchBlocks(
  tree: TreeBlock[],
  id: string
): TreeBlock | undefined {
  const stack = [...tree]
  while (stack.length > 0) {
    const node = stack.pop()
    if (node != null) {
      if (node.id === id) return node
      if (node.children.length > 0) stack.push(...node.children)
    }
  }
}
