export interface BlockLike {
  id: string
  typename: string
  parentBlockId: string | null
  parentOrder: number | null
  content?: unknown
  exportOrder?: number | null
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
    let heading = ''
    if (typeof c === 'string') {
      heading = c
    } else if (
      c != null &&
      typeof c === 'object' &&
      'text' in (c as Record<string, unknown>) &&
      typeof (c as Record<string, unknown>).text === 'string'
    ) {
      heading = (c as Record<string, unknown>).text as string
    }
    // Normalize whitespace: replace newlines and multiple spaces with single space
    return heading.replace(/\s+/g, ' ').trim()
  }
  return ''
}

export interface JourneyExportColumn {
  key: string
  label: string
  blockId: string | null
  typename: string
  /** Column index for exports - used to map data to the correct column */
  exportOrder?: number | null
}

export interface BlockHeaderRecord {
  blockId: string
  label: string
}

/**
 * Deduplicates block headers by blockId, keeping only the first label encountered for each blockId.
 * This prevents creating multiple columns for the same block when events have different labels
 * (e.g., when a block's label changes or when the fallback step heading is used initially).
 */
export function deduplicateBlockHeadersByBlockId(
  headers: BlockHeaderRecord[]
): BlockHeaderRecord[] {
  const seenBlockIds = new Set<string>()
  return headers.filter((header) => {
    if (seenBlockIds.has(header.blockId)) {
      return false
    }
    seenBlockIds.add(header.blockId)
    return true
  })
}

interface BuildJourneyExportColumnsOptions {
  baseColumns?: JourneyExportColumn[]
  blockHeaders: BlockHeaderRecord[]
  journeyBlocks: BlockLike[]
  orderIndex: Map<string, number>
}

export function buildJourneyExportColumns({
  baseColumns = [],
  blockHeaders,
  journeyBlocks,
  orderIndex
}: BuildJourneyExportColumnsOptions): JourneyExportColumn[] {
  const idToBlock = new Map(journeyBlocks.map((block) => [block.id, block]))

  // Separate blocks with exportOrder (fixed positions) from those without
  const headersWithExportOrder: Array<
    BlockHeaderRecord & { exportOrder: number }
  > = []
  const headersWithoutExportOrder: BlockHeaderRecord[] = []

  const deduplicatedHeaders = deduplicateBlockHeadersByBlockId(blockHeaders)

  for (const header of deduplicatedHeaders) {
    const block = idToBlock.get(header.blockId)
    if (block?.exportOrder != null) {
      headersWithExportOrder.push({ ...header, exportOrder: block.exportOrder })
    } else {
      headersWithoutExportOrder.push(header)
    }
  }

  // Sort blocks with exportOrder by their exportOrder value
  headersWithExportOrder.sort((a, b) => a.exportOrder - b.exportOrder)

  // Sort blocks without exportOrder by render tree order
  headersWithoutExportOrder.sort((a, b) =>
    compareHeadersByRenderOrder(a, b, orderIndex)
  )

  // Combine: blocks with exportOrder first (maintaining their positions), then new blocks
  const orderedHeaders = [
    ...headersWithExportOrder,
    ...headersWithoutExportOrder
  ]

  const blockColumns = orderedHeaders.map<JourneyExportColumn>((item) => {
    // Normalize label: replace all newlines/multiple spaces with single space, then trim
    const normalizedLabel = item.label.replace(/\s+/g, ' ').trim()
    const block = idToBlock.get(item.blockId)
    return {
      key: `${item.blockId}-${normalizedLabel}`,
      label: normalizedLabel,
      blockId: item.blockId,
      typename: block?.typename ?? '',
      exportOrder: block?.exportOrder ?? null
    }
  })

  return [...baseColumns, ...blockColumns]
}

function compareHeadersByRenderOrder(
  a: BlockHeaderRecord,
  b: BlockHeaderRecord,
  orderIndex: Map<string, number>
): number {
  const aOrder =
    a.blockId != null
      ? (orderIndex.get(a.blockId) ?? Number.MAX_SAFE_INTEGER)
      : Number.MAX_SAFE_INTEGER
  const bOrder =
    b.blockId != null
      ? (orderIndex.get(b.blockId) ?? Number.MAX_SAFE_INTEGER)
      : Number.MAX_SAFE_INTEGER
  if (aOrder !== bOrder) return aOrder - bOrder
  return (a.blockId ?? '').localeCompare(b.blockId ?? '')
}

interface BaseColumnLabelResolverParams {
  column: JourneyExportColumn
  userTimezone: string
}

export type BaseColumnLabelResolver = (
  params: BaseColumnLabelResolverParams
) => string

interface BuildHeaderRowsOptions {
  columns: JourneyExportColumn[]
  userTimezone: string
  getCardHeading: (blockId: string | null | undefined) => string
  baseColumnLabelResolver?: BaseColumnLabelResolver
}

export interface HeaderRows {
  headerRow: string[]
}

export function buildHeaderRows({
  columns,
  userTimezone,
  getCardHeading,
  baseColumnLabelResolver
}: BuildHeaderRowsOptions): HeaderRows {
  const resolveBaseColumnLabel =
    baseColumnLabelResolver ??
    (({ column }: BaseColumnLabelResolverParams) => column.label)

  const headerRow = columns.map((column) => {
    // Base columns (no blockId) - use resolver
    if (column.blockId == null) {
      return resolveBaseColumnLabel({
        column,
        userTimezone
      })
    }

    const cardHeading = getCardHeading(column.blockId)

    // For RadioQuestionBlock: "Poll (Card Heading)" or "Poll"
    if (column.typename === 'RadioQuestionBlock') {
      return cardHeading ? `Poll (${cardHeading})` : 'Poll'
    }

    // For MultiselectBlock: "Multiselect (Card Heading)" or "Multiselect"
    if (column.typename === 'MultiselectBlock') {
      return cardHeading ? `Multiselect (${cardHeading})` : 'Multiselect'
    }

    // For other block types: use the label
    return column.label
  })

  return { headerRow }
}
