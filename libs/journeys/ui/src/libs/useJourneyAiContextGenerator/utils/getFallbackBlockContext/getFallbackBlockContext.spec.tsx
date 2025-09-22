import { getFallbackBlockContext } from './getFallbackBlockContext'

describe('getFallbackBlockContext', () => {
  it('should create a fallback block context with default values', () => {
    const blockId = 'test-block-1'
    const contextText = 'Test context text'

    const result = getFallbackBlockContext(blockId, contextText)

    expect(result).toEqual({
      blockId: 'test-block-1',
      contextText: 'Test context text',
      language: 'english',
      suggestions: []
    })
  })

  it('should handle empty strings', () => {
    const result = getFallbackBlockContext('', '')

    expect(result).toEqual({
      blockId: '',
      contextText: '',
      language: 'english',
      suggestions: []
    })
  })
})
