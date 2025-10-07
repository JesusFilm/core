import { createFallbackContextResponse } from './createFallbackContextResponse'

describe('createFallbackContextResponse', () => {
  it('should create a fallback context response from block contexts', () => {
    const blockContexts = [
      { blockId: 'block-1', contextText: 'Context 1' },
      { blockId: 'block-2', contextText: 'Context 2' }
    ]

    const result = createFallbackContextResponse(blockContexts)

    expect(result).toEqual({
      blockContexts: [
        {
          blockId: 'block-1',
          contextText: 'Context 1',
          language: 'english',
          suggestions: []
        },
        {
          blockId: 'block-2',
          contextText: 'Context 2',
          language: 'english',
          suggestions: []
        }
      ]
    })
  })

  it('should handle empty array', () => {
    const result = createFallbackContextResponse([])

    expect(result).toEqual({
      blockContexts: []
    })
  })
})
