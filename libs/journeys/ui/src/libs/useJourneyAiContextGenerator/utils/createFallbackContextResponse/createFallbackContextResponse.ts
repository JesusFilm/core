import { BlockContext } from '../../types'
import { getFallbackBlockContext } from '../getFallbackBlockContext'

interface ContextResponse {
  blockContexts: BlockContext[]
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
