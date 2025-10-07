import { BlockContext } from '../../types'

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
