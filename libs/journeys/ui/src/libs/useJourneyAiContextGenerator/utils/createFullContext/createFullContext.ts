interface BlockContext {
  blockId: string
  contextText: string
}

interface ContextResponseItem {
  blockId: string
  originalText: string
  enrichedContext: string
}

export interface FullBlockContext {
  blockId: string
  rawText: string
  enrichedContext: string
}

export function createFullContext(
  rawContexts: BlockContext[],
  enrichedContexts: ContextResponseItem[]
): FullBlockContext[] {
  const enrichedMap = new Map(
    enrichedContexts.map((item) => [item.blockId, item.enrichedContext])
  )

  return rawContexts.map((raw) => ({
    blockId: raw.blockId,
    rawText: raw.contextText,
    enrichedContext: enrichedMap.get(raw.blockId) ?? raw.contextText
  }))
}
