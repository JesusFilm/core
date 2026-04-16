interface BlockContext {
  blockId: string
  contextText: string
}

interface ContextResponseItem {
  blockId: string
  originalText: string
  enrichedContext: string
}

export function createFallbackContextResponse(
  blocks: BlockContext[]
): ContextResponseItem[] {
  return blocks.map((block) => ({
    blockId: block.blockId,
    originalText: block.contextText,
    enrichedContext: block.contextText
  }))
}
