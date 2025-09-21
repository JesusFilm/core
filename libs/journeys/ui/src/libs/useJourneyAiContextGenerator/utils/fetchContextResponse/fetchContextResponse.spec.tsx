import { fetchContextResponse } from './fetchContextResponse'

// Mock fetch globally
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('fetchContextResponse', () => {
  const mockSetError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
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
