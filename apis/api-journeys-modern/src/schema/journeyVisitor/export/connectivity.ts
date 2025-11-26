import { SimpleBlock } from './order'

export interface ConnectivityFilterOptions {
  simpleBlocks: SimpleBlock[]
  journeyBlocks: Array<{
    id: string
    typename: string
    parentBlockId: string | null
    nextBlockId: string | null
    action?: { blockId?: unknown } | null
  }>
}

/**
 * Computes the set of block IDs that are reachable from the journey's entry step.
 * Only includes blocks under steps that can be reached via nextBlockId or button navigate actions.
 */
export function computeConnectedBlockIds({
  simpleBlocks,
  journeyBlocks
}: ConnectivityFilterOptions): Set<string> {
  // Build children map for traversal
  const childrenByParent = new Map<string, typeof journeyBlocks>()
  journeyBlocks.forEach((block) => {
    if (block.parentBlockId != null) {
      const arr = childrenByParent.get(block.parentBlockId) ?? []
      arr.push(block)
      childrenByParent.set(block.parentBlockId, arr)
    }
  })

  // Get all step IDs
  const stepIds = new Set(
    journeyBlocks.filter((b) => b.typename === 'StepBlock').map((b) => b.id)
  )

  // Build outgoing edges between steps
  const outgoingByStep = new Map<string, Set<string>>()
  const addEdge = (from: string, to: string): void => {
    if (!stepIds.has(to)) return
    const set = outgoingByStep.get(from) ?? new Set<string>()
    set.add(to)
    outgoingByStep.set(from, set)
  }

  // nextBlockId edges
  journeyBlocks.forEach((block) => {
    if (block.typename === 'StepBlock' && block.nextBlockId != null) {
      addEdge(block.id, block.nextBlockId)
    }
  })

  // Helper: collect descendants under a parent id
  function collectDescendants(
    rootId: string,
    acc: typeof journeyBlocks = []
  ): typeof journeyBlocks {
    const kids = childrenByParent.get(rootId) ?? []
    for (const child of kids) {
      acc.push(child)
      collectDescendants(child.id, acc)
    }
    return acc
  }

  // Extract navigate target from action if present
  function getNavigateTargetId(
    block: (typeof journeyBlocks)[0]
  ): string | undefined {
    const action = block.action
    const blockId = action?.blockId
    return typeof blockId === 'string' ? blockId : undefined
  }

  // Button navigate edges: from each step to any step targeted by descendants' actions
  journeyBlocks
    .filter((b) => b.typename === 'StepBlock')
    .forEach((step) => {
      const descendants = collectDescendants(step.id, [])
      descendants.forEach((node) => {
        const targetId = getNavigateTargetId(node)
        if (targetId != null) addEdge(step.id, targetId)
      })
    })

  // Entry step: first top-level StepBlock by parentOrder (renderer default)
  function chooseEntryStepId(): string | null {
    const topLevelSteps = journeyBlocks
      .filter((b) => b.typename === 'StepBlock' && b.parentBlockId == null)
      .sort((a, b) => {
        const aOrder =
          (a as { parentOrder?: number | null }).parentOrder ?? 9999
        const bOrder =
          (b as { parentOrder?: number | null }).parentOrder ?? 9999
        return aOrder - bOrder
      })
    return topLevelSteps[0]?.id ?? null
  }

  const entryStepId = chooseEntryStepId()
  const connectedStepIds = new Set<string>()

  if (entryStepId != null) {
    const queue: string[] = [entryStepId]
    const visited = new Set<string>()
    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      visited.add(current)
      connectedStepIds.add(current)
      const nextSet = outgoingByStep.get(current)
      if (nextSet != null) nextSet.forEach((next) => queue.push(next))
    }
  }

  // Allowed blocks: all descendants (and the step itself) for each connected step
  const connectedAllowedBlockIds = new Set<string>()
  function dfsCollect(blockId: string): void {
    connectedAllowedBlockIds.add(blockId)
    const kids = childrenByParent.get(blockId) ?? []
    for (const child of kids) dfsCollect(child.id)
  }

  connectedStepIds.forEach((stepId) => {
    dfsCollect(stepId)
  })

  return connectedAllowedBlockIds
}
