import { BlockContext } from '../../types'

interface ContextResponse {
  blockContexts: BlockContext[]
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
