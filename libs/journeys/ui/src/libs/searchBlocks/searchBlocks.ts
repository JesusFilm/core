import type { TreeBlock } from '../block'

interface SearchBlockOptions {
  filter: 'searchStepsOnly' | 'searchAll'
}

export function searchBlocks(
  tree: TreeBlock[],
  id: string,
  options: SearchBlockOptions = { filter: 'searchAll' }
): TreeBlock | undefined {
  const stack = [...tree]
  while (stack.length > 0) {
    const node = stack.pop()
    if (node != null) {
      if (node.id === id) return node
      if (node.children.length > 0 && options.filter === 'searchAll')
        stack.push(...node.children)
    }
  }
}
