import { BlockContext } from '../../types'
import { createFallbackContextResponse } from '../createFallbackContextResponse'

interface ContextResponse {
  blockContexts: BlockContext[]
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
