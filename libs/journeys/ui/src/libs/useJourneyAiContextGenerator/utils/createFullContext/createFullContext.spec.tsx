import { createFullContext } from './createFullContext'

describe('createFullContext', () => {
  it('should merge block contexts with context response', () => {
    const blockContexts = [
      { blockId: 'block-1', contextText: 'Context 1' },
      { blockId: 'block-2', contextText: 'Context 2' }
    ]

    const contextResponse = {
      blockContexts: [
        {
          blockId: 'block-1',
          contextText: 'Context 1',
          language: 'spanish',
          suggestions: ['suggestion1', 'suggestion2']
        },
        {
          blockId: 'block-2',
          contextText: 'Context 2',
          language: 'french',
          suggestions: ['suggestion3']
        }
      ]
    }

    const result = createFullContext(blockContexts, contextResponse)

    expect(result).toEqual([
      {
        blockId: 'block-1',
        contextText: 'Context 1',
        language: 'spanish',
        suggestions: ['suggestion1', 'suggestion2']
      },
      {
        blockId: 'block-2',
        contextText: 'Context 2',
        language: 'french',
        suggestions: ['suggestion3']
      }
    ])
  })

  it('should use fallback values when context response is null', () => {
    const blockContexts = [{ blockId: 'block-1', contextText: 'Context 1' }]

    const result = createFullContext(blockContexts, null)

    expect(result).toEqual([
      {
        blockId: 'block-1',
        contextText: 'Context 1',
        language: 'english',
        suggestions: []
      }
    ])
  })

  it('should use fallback values when block context is not found in response', () => {
    const blockContexts = [
      { blockId: 'block-1', contextText: 'Context 1' },
      { blockId: 'block-2', contextText: 'Context 2' }
    ]

    const contextResponse = {
      blockContexts: [
        {
          blockId: 'block-1',
          contextText: 'Context 1',
          language: 'spanish',
          suggestions: ['suggestion1']
        }
      ]
    }

    const result = createFullContext(blockContexts, contextResponse)

    expect(result).toEqual([
      {
        blockId: 'block-1',
        contextText: 'Context 1',
        language: 'spanish',
        suggestions: ['suggestion1']
      },
      {
        blockId: 'block-2',
        contextText: 'Context 2',
        language: 'english',
        suggestions: []
      }
    ])
  })
})
