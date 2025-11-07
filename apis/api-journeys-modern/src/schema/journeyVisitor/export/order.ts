export interface SimpleBlock {
  id: string
  typename: string
  parentBlockId: string | null
  parentOrder: number | null
}

export interface TreeNode extends SimpleBlock {
  children: TreeNode[]
}

/**
 * Build a render tree mirroring the client transformer behavior:
 * - Sort by parentOrder ascending
 * - Link children by parentBlockId
 * - Return only StepBlock roots (parentBlockId === null)
 */
export function buildRenderTree(blocks: SimpleBlock[]): TreeNode[] {
  const childrenOf: Record<string, TreeNode[] | undefined> = {}
  const roots: TreeNode[] = []

  const sorted = [...blocks].sort((a, b) => {
    const ao = a.parentOrder ?? Number.MAX_SAFE_INTEGER
    const bo = b.parentOrder ?? Number.MAX_SAFE_INTEGER
    if (ao !== bo) return ao - bo
    return a.id.localeCompare(b.id)
  })

  for (const item of sorted) {
    const node: TreeNode = { ...item, children: [] }
    const { id, parentBlockId } = item
    childrenOf[id] ||= []
    node.children = childrenOf[id]!
    if (parentBlockId != null) {
      const parentChildren = (childrenOf[parentBlockId] ||= [])
      parentChildren.push(node)
    } else if (item.typename === 'StepBlock') {
      roots.push(node)
    }
  }

  return roots
}

/**
 * Compute a stable pre-order traversal index for each block id.
 * Skips nodes with null parentOrder and does not recurse into their subtrees
 * to mirror BlockRenderer's guard.
 */
export function computeOrderIndex(roots: TreeNode[]): Map<string, number> {
  const orderIndex = new Map<string, number>()
  let counter = 0

  const visit = (node: TreeNode): void => {
    if (node.parentOrder == null) return
    orderIndex.set(node.id, counter++)
    for (const child of node.children) visit(child)
  }

  for (const root of roots) visit(root)
  return orderIndex
}
