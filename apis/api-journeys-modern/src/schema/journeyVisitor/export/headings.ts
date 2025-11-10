export interface BlockLike {
  id: string
  typename: string
  parentBlockId: string | null
  parentOrder: number | null
  content?: unknown
}

export function getAncestorByType(
  idToBlock: Map<string, BlockLike>,
  blockId: string | null | undefined,
  type: string
): BlockLike | undefined {
  const visited = new Set<string>()
  let curId: string | null | undefined = blockId
  let current: BlockLike | undefined
  while (curId != null) {
    if (visited.has(curId)) return undefined
    visited.add(curId)
    current = idToBlock.get(curId)
    if (current == null) return undefined
    if (current.typename === type) return current
    curId = current.parentBlockId
  }
  return undefined
}

export function getTopLevelChildUnderCard(
  idToBlock: Map<string, BlockLike>,
  blockId: string | null | undefined
): BlockLike | undefined {
  const visited = new Set<string>()
  let current: BlockLike | undefined =
    blockId != null ? idToBlock.get(blockId) : undefined
  if (current?.id != null) visited.add(current.id)
  let parent: BlockLike | undefined =
    current?.parentBlockId != null
      ? idToBlock.get(current.parentBlockId)
      : undefined
  // Climb until parent is a CardBlock; return the child right under Card
  while (current != null && parent != null && parent.typename !== 'CardBlock') {
    if (visited.has(parent.id)) break
    visited.add(parent.id)
    current = parent
    parent =
      current.parentBlockId != null
        ? idToBlock.get(current.parentBlockId)
        : undefined
  }
  return current
}

export function getCardHeading(
  idToBlock: Map<string, BlockLike>,
  allBlocks: BlockLike[],
  blockId: string | null | undefined
): string {
  const cardBlock = getAncestorByType(idToBlock, blockId, 'CardBlock')
  if (cardBlock == null) return ''
  // Find all TypographyBlock children of this card
  const typographyBlocks = allBlocks
    .filter(
      (b) =>
        b.typename === 'TypographyBlock' && b.parentBlockId === cardBlock.id
    )
    .sort((a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0))
  if (typographyBlocks.length > 0) {
    const firstTypography = typographyBlocks[0]
    const c = firstTypography.content
    if (typeof c === 'string') return c
    if (
      c != null &&
      typeof c === 'object' &&
      'text' in (c as Record<string, unknown>) &&
      typeof (c as Record<string, unknown>).text === 'string'
    ) {
      return (c as Record<string, unknown>).text as string
    }
  }
  return ''
}
