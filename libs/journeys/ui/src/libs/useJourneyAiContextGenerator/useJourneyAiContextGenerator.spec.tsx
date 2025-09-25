import { act, renderHook, waitFor } from '@testing-library/react'

import { TreeBlock } from '../block'

import { useJourneyAiContextGenerator } from './useJourneyAiContextGenerator'

// Mock the context extraction utility
jest.mock('../../components/AiChat/utils/contextExtraction', () => ({
  extractBlockContext: jest.fn((block: TreeBlock) => `Context for ${block.id}`)
}))

// Mock fetch
global.fetch = jest.fn()

const mockTreeBlocks: TreeBlock[] = [
  {
    id: 'block1',
    __typename: 'TypographyBlock',
    content: 'Test content 1',
    children: []
  } as unknown as TreeBlock,
  {
    id: 'block2',
    __typename: 'ButtonBlock',
    label: 'Test button',
    children: []
  } as unknown as TreeBlock
]

const mockContextResponse = {
  blockContexts: [
    {
      blockId: 'block1',
      contextText: 'Context for block1',
      language: 'english',
      suggestions: []
    },
    {
      blockId: 'block2',
      contextText: 'Context for block2',
      language: 'spanish',
      suggestions: []
    }
  ]
}

describe('useJourneyAiContextGenerator', () => {
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockContextResponse)
    })

    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // Suppress console.error during tests
    })
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('should initialize with empty context data and loading state', () => {
    const { result } = renderHook(() => useJourneyAiContextGenerator([]))

    expect(result.current.aiContextData).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should process blocks and generate context data', async () => {
    const { result } = renderHook(() =>
      useJourneyAiContextGenerator(mockTreeBlocks)
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.aiContextData).toEqual([
      {
        blockId: 'block1',
        contextText: 'Context for block1',
        language: 'english',
        suggestions: []
      },
      {
        blockId: 'block2',
        contextText: 'Context for block2',
        language: 'spanish',
        suggestions: []
      }
    ])
    expect(result.current.error).toBe(null)
  })

  it('should handle API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() =>
      useJourneyAiContextGenerator(mockTreeBlocks)
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.aiContextData).toEqual([
      {
        blockId: 'block1',
        contextText: 'Context for block1',
        language: 'english',
        suggestions: []
      },
      {
        blockId: 'block2',
        contextText: 'Context for block2',
        language: 'english',
        suggestions: []
      }
    ])
    expect(result.current.error).toBe('API Error')
  })

  it('should handle non-ok API responses', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Bad Request'
    })

    const { result } = renderHook(() =>
      useJourneyAiContextGenerator(mockTreeBlocks)
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.aiContextData).toEqual([
      {
        blockId: 'block1',
        contextText: 'Context for block1',
        language: 'english',
        suggestions: []
      },
      {
        blockId: 'block2',
        contextText: 'Context for block2',
        language: 'english',
        suggestions: []
      }
    ])
    expect(result.current.error).toBe(null)
  })

  it('should handle empty treeBlocks array', async () => {
    const { result } = renderHook(() => useJourneyAiContextGenerator([]))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.aiContextData).toEqual([])
    expect(fetch).not.toHaveBeenCalled()
  })
})
