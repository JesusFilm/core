import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { TreeBlock } from '../block'

import { createFallbackContextResponse } from './utils/createFallbackContextResponse'
import {
  FullBlockContext,
  createFullContext
} from './utils/createFullContext'
import { extractBlockContexts } from './utils/extractBlockContexts'
import { fetchContextResponse } from './utils/fetchContextResponse'

interface UseJourneyAiContextGeneratorResult {
  aiContextData: FullBlockContext[]
  isLoading: boolean
  error: Error | null
}

export function useJourneyAiContextGenerator(
  treeBlocks: TreeBlock[],
  language?: string
): UseJourneyAiContextGeneratorResult {
  const [aiContextData, setAiContextData] = useState<FullBlockContext[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const previousBlocksRef = useRef<string>('')

  const rawContexts = useMemo(
    () => extractBlockContexts(treeBlocks),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(treeBlocks)]
  )

  const generateContext = useCallback(async () => {
    if (rawContexts.length === 0) return

    const blocksKey = JSON.stringify(rawContexts)
    if (blocksKey === previousBlocksRef.current) return
    previousBlocksRef.current = blocksKey

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchContextResponse(rawContexts, language)
      const fullContext = createFullContext(rawContexts, response.contexts)
      setAiContextData(fullContext)
    } catch (err) {
      const fallback = createFallbackContextResponse(rawContexts)
      const fullContext = createFullContext(rawContexts, fallback)
      setAiContextData(fullContext)
      setError(
        err instanceof Error ? err : new Error('Failed to generate context')
      )
    } finally {
      setIsLoading(false)
    }
  }, [rawContexts, language])

  useEffect(() => {
    void generateContext()
  }, [generateContext])

  return { aiContextData, isLoading, error }
}
