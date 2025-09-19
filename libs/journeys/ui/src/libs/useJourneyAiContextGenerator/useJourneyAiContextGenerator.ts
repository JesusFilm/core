import { useEffect, useMemo, useState } from 'react'

import { extractBlockContext } from '../../components/AiChat/utils/contextExtraction'
import { TreeBlock } from '../block'

import { BlockContext } from './types'

interface ContextResponse {
  blockContexts: BlockContext[]
}

function getFallbackBlockContext(
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

function createFallbackContextResponse(
  blockContexts: Array<{ blockId: string; contextText: string }>
): ContextResponse {
  return {
    blockContexts: blockContexts.map((context) =>
      getFallbackBlockContext(context.blockId, context.contextText)
    )
  }
}

function extractBlockContexts(treeBlocks: TreeBlock[]) {
  return treeBlocks.map((block) => ({
    blockId: block.id,
    contextText: extractBlockContext(block)
  }))
}

function createFullContext(
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

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error occurred'
}

async function fetchContextResponse(
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
    setError(getErrorMessage(fetchError))
    return createFallbackContextResponse(blockContexts)
  }
}

/**
 * Generates and manages AI context data from journey blocks.
 * Use this hook in components that need to initialize AI context.
 * @param treeBlocks - The journey blocks to extract context from
 * @returns AI context data, loading state, and error handling
 */
export function useJourneyAiContextGenerator(treeBlocks: TreeBlock[]): {
  aiContextData: BlockContext[]
  isLoading: boolean
  error: string | null
} {
  const [aiContextData, setAiContextData] = useState<BlockContext[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoize treeBlocks to prevent infinite loops when the array reference changes
  // We use JSON.stringify to create a stable dependency based on content, not reference
  const treeBlocksKey = useMemo(() => JSON.stringify(treeBlocks), [treeBlocks])

  useEffect(() => {
    // Load context when treeBlocks is available and not empty
    if (!treeBlocks || treeBlocks.length === 0) {
      setAiContextData([])
      return
    }

    setIsLoading(true)
    setError(null)

    const processContext = async () => {
      try {
        const blockContexts = extractBlockContexts(treeBlocks)
        const contextResponse = await fetchContextResponse(
          blockContexts,
          setError
        )
        const fullContext = createFullContext(blockContexts, contextResponse)
        setAiContextData(fullContext)
      } catch (err) {
        setError(getErrorMessage(err))
        console.error('Error processing AI context:', err)
      } finally {
        setIsLoading(false)
      }
    }

    void processContext()
  }, [treeBlocksKey])

  return {
    aiContextData,
    isLoading,
    error
  }
}
