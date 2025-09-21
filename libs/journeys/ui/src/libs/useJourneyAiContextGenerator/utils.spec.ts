import { extractBlockContext } from '../../components/AiChat/utils/contextExtraction'

import { BlockContext } from './types'
import {
  createFallbackContextResponse,
  createFullContext,
  extractBlockContexts,
  fetchContextResponse,
  getFallbackBlockContext
} from './utils'

// Mock the extractBlockContext function
jest.mock('../../components/AiChat/utils/contextExtraction', () => ({
  extractBlockContext: jest.fn()
}))

const mockExtractBlockContext = extractBlockContext as jest.MockedFunction<
  typeof extractBlockContext
>

// Mock fetch globally
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('Journey AI Context Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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

  describe('extractBlockContexts', () => {
    it('should extract block contexts from tree blocks', () => {
      const treeBlocks = [
        { id: 'block-1', type: 'text' },
        { id: 'block-2', type: 'image' }
      ] as any[]

      mockExtractBlockContext
        .mockReturnValueOnce('Extracted context 1')
        .mockReturnValueOnce('Extracted context 2')

      const result = extractBlockContexts(treeBlocks)

      expect(result).toEqual([
        { blockId: 'block-1', contextText: 'Extracted context 1' },
        { blockId: 'block-2', contextText: 'Extracted context 2' }
      ])
      expect(mockExtractBlockContext).toHaveBeenCalledTimes(2)
      expect(mockExtractBlockContext).toHaveBeenCalledWith(treeBlocks[0])
      expect(mockExtractBlockContext).toHaveBeenCalledWith(treeBlocks[1])
    })

    it('should handle empty tree blocks array', () => {
      const result = extractBlockContexts([])

      expect(result).toEqual([])
      expect(mockExtractBlockContext).not.toHaveBeenCalled()
    })
  })

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

  describe('fetchContextResponse', () => {
    const mockSetError = jest.fn()

    beforeEach(() => {
      mockSetError.mockClear()
    })

    it('should successfully fetch context response', async () => {
      const blockContexts = [{ blockId: 'block-1', contextText: 'Context 1' }]

      const mockResponse = {
        blockContexts: [
          {
            blockId: 'block-1',
            contextText: 'Context 1',
            language: 'spanish',
            suggestions: ['suggestion1']
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      } as any)

      const result = await fetchContextResponse(blockContexts, mockSetError)

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith('/api/chat/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockContexts })
      })
      expect(mockSetError).not.toHaveBeenCalled()
    })

    it('should return fallback response when fetch is not ok', async () => {
      const blockContexts = [{ blockId: 'block-1', contextText: 'Context 1' }]

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      } as any)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await fetchContextResponse(blockContexts, mockSetError)

      expect(result).toEqual({
        blockContexts: [
          {
            blockId: 'block-1',
            contextText: 'Context 1',
            language: 'english',
            suggestions: []
          }
        ]
      })
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to get journey contexts:',
        'Not Found'
      )
      expect(mockSetError).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should return fallback response and set error when fetch throws', async () => {
      const blockContexts = [{ blockId: 'block-1', contextText: 'Context 1' }]

      const fetchError = new Error('Network error')
      mockFetch.mockRejectedValueOnce(fetchError)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await fetchContextResponse(blockContexts, mockSetError)

      expect(result).toEqual({
        blockContexts: [
          {
            blockId: 'block-1',
            contextText: 'Context 1',
            language: 'english',
            suggestions: []
          }
        ]
      })
      expect(mockSetError).toHaveBeenCalledWith('Network error')
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error extracting journey contexts:',
        fetchError
      )

      consoleSpy.mockRestore()
    })

    it('should handle non-Error fetch exceptions', async () => {
      const blockContexts = [{ blockId: 'block-1', contextText: 'Context 1' }]

      mockFetch.mockRejectedValueOnce('String error')

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await fetchContextResponse(blockContexts, mockSetError)

      expect(result).toEqual({
        blockContexts: [
          {
            blockId: 'block-1',
            contextText: 'Context 1',
            language: 'english',
            suggestions: []
          }
        ]
      })
      expect(mockSetError).toHaveBeenCalledWith('Unknown error occurred')

      consoleSpy.mockRestore()
    })
  })
})
