import { useEffect, useMemo, useState } from 'react'

import { TreeBlock } from '../block'

import { BlockContext } from './types'
import {
  createFullContext,
  extractBlockContexts,
  fetchContextResponse
} from './utils'

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
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
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
