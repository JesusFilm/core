import { extractBlockContext } from '../../components/AiChat/utils/contextExtraction'
import { TreeBlock } from '../block'

import { BlockContext } from './types'

interface ContextResponse {
  blockContexts: BlockContext[]
}

export function getFallbackBlockContext(
  blockId: string,
  contextText: string
): BlockContext {
  return {
    blockId: blockId,
    contextText: contextText,
    language: 'english',
    suggestions: []
  }
}

export function createFallbackContextResponse(
  blockContexts: Array<{ blockId: string; contextText: string }>
): ContextResponse {
  return {
    blockContexts: blockContexts.map((context) =>
      getFallbackBlockContext(context.blockId, context.contextText)
    )
  }
}

export function extractBlockContexts(treeBlocks: TreeBlock[]) {
  return treeBlocks.map((block) => ({
    blockId: block.id,
    contextText: extractBlockContext(block)
  }))
}

export function createFullContext(
  blockContexts: Array<{ blockId: string; contextText: string }>,
  contextResponse: ContextResponse | null
): BlockContext[] {
  return blockContexts.map((context) => {
    const contextBlock = contextResponse?.blockContexts?.find(
      (bc) => bc.blockId === context.blockId
    )
    return {
      blockId: context.blockId,
      contextText: context.contextText,
      language: contextBlock?.language || 'english',
      suggestions: contextBlock?.suggestions || []
    }
  })
}

export async function fetchContextResponse(
  blockContexts: Array<{ blockId: string; contextText: string }>,
  setError: (error: string | null) => void
): Promise<ContextResponse> {
  try {
    const response = await fetch('/api/chat/context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockContexts })
    })

    if (response.ok) {
      const responseData = await response.json()
      return responseData
    }

    console.error('Failed to get journey contexts:', response.statusText)
    return createFallbackContextResponse(blockContexts)
  } catch (fetchError) {
    console.error('Error extracting journey contexts:', fetchError)
    setError(
      fetchError instanceof Error
        ? fetchError.message
        : 'Unknown error occurred'
    )
    return createFallbackContextResponse(blockContexts)
  }
}
