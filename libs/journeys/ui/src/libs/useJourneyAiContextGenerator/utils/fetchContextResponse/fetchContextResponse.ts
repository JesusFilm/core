interface BlockContext {
  blockId: string
  contextText: string
}

interface ContextResponseItem {
  blockId: string
  originalText: string
  enrichedContext: string
}

interface FetchContextResponseResult {
  contexts: ContextResponseItem[]
}

export async function fetchContextResponse(
  blocks: BlockContext[],
  language?: string
): Promise<FetchContextResponseResult> {
  const response = await fetch('/api/chat/context', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks, language })
  })

  if (!response.ok) {
    throw new Error(`Context API returned ${response.status}`)
  }

  return response.json() as Promise<FetchContextResponseResult>
}
