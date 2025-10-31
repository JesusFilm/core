import { renderHook, act, waitFor } from '@testing-library/react'
import { useAiStream } from './useAiStream'

// Mock fetch
global.fetch = jest.fn()

// Mock EventSource
type EventListener = (event: Event) => void

const mockEventSource = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn(),
  dispatchEvent: jest.fn(),
  onerror: null as ((event: Event) => void) | null,
  onopen: null as ((event: Event) => void) | null
}

const createMockEventSource = () => {
  const listeners: Record<string, EventListener[]> = {}

  return {
    ...mockEventSource,
    addEventListener: jest.fn((event: string, listener: EventListener) => {
      if (!listeners[event]) listeners[event] = []
      listeners[event].push(listener)
    }),
    removeEventListener: jest.fn((event: string, listener: EventListener) => {
      if (listeners[event]) {
        const index = listeners[event].indexOf(listener)
        if (index > -1) listeners[event].splice(index, 1)
      }
    }),
    _triggerEvent: (eventType: string, event: Event) => {
      listeners[eventType]?.forEach(listener => listener(event))
    }
  }
}

global.EventSource = jest.fn().mockImplementation(createMockEventSource)

describe('useAiStream', () => {
  let mockEventSourceInstance: ReturnType<typeof createMockEventSource> | null

  beforeEach(() => {
    jest.clearAllMocks()
    mockEventSourceInstance = null
  })

  const getMockEventSourceInstance = () => {
    if (!mockEventSourceInstance) {
      throw new Error('Mock EventSource not initialized')
    }
    return mockEventSourceInstance
  }

  it('should start in idle state', () => {
    const { result } = renderHook(() => useAiStream())

    expect(result.current.isStreaming).toBe(false)
    expect(result.current.text).toBe('')
    expect(result.current.chunks).toEqual([])
    expect(result.current.usage).toBeNull()
    expect(result.current.message).toBeNull()
    expect(result.current.conversationMap).toBeNull()
    expect(result.current.steps).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should handle successful session creation', async () => {
    const mockResponse = { id: 'test-session-id' }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const { result } = renderHook(() => useAiStream())

    await act(async () => {
      await result.current.startStream({
        messages: [{ role: 'user', content: 'Hello' }],
        provider: 'openrouter'
      })
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/ai/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        provider: 'openrouter'
      }),
      signal: expect.any(AbortSignal)
    })

    // EventSource should be created with the session URL
    expect(global.EventSource).toHaveBeenCalledWith('/api/ai/stream?id=test-session-id')
  })

  it('should handle session creation failure', async () => {
    const errorMessage = 'Session creation failed'
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage })
    })

    const { result } = renderHook(() => useAiStream())

    await act(async () => {
      await result.current.startStream({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    expect(result.current.error).toBe(errorMessage)
    expect(result.current.isStreaming).toBe(false)
  })

  it('should accumulate text from delta events', async () => {
    const { result } = renderHook(() => useAiStream())

    // Start streaming to create EventSource
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'test-session' })
    })

    await act(async () => {
      await result.current.startStream({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    // Wait for EventSource to be created
    await waitFor(() => {
      const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
      expect(latestInstance).not.toBeNull()
      mockEventSourceInstance = latestInstance
    })

    // Simulate EventSource events
    act(() => {
      const instance = getMockEventSourceInstance()
      instance._triggerEvent('open', new Event('open'))

      instance._triggerEvent('delta', new MessageEvent('delta', {
        data: JSON.stringify({ text: 'Hello' })
      }))
      instance._triggerEvent('delta', new MessageEvent('delta', {
        data: JSON.stringify({ text: ' world' })
      }))
    })

    expect(result.current.text).toBe('Hello world')
    expect(result.current.chunks).toHaveLength(2)
  })

  it('should handle usage events', async () => {
    const { result } = renderHook(() => useAiStream())

    // Start streaming to create EventSource
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'test-session' })
    })

    await act(async () => {
      await result.current.startStream({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    // Wait for EventSource to be created
    await waitFor(() => {
      const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
      expect(latestInstance).not.toBeNull()
      mockEventSourceInstance = latestInstance
    })

    const usage = {
      input_tokens: 10,
      output_tokens: 20,
      total_tokens: 30
    }

    act(() => {
      const instance = getMockEventSourceInstance()
      instance._triggerEvent('usage', new MessageEvent('usage', {
        data: JSON.stringify(usage)
      }))
    })

    expect(result.current.usage).toEqual(usage)
  })

  it('should handle steps events', async () => {
    const { result } = renderHook(() => useAiStream())

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'test-session' })
    })

    await act(async () => {
      await result.current.startStream({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    await waitFor(() => {
      const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
      expect(latestInstance).not.toBeNull()
      mockEventSourceInstance = latestInstance
    })

    const stepsPayload = {
      steps: [
        { content: 'Step 1 content', keywords: 'light, hope, mercy' },
        { content: 'Step 2 content', keywords: 'grace, faith, love' }
      ]
    }

    act(() => {
      const instance = getMockEventSourceInstance()
      instance._triggerEvent('steps', new MessageEvent('steps', {
        data: JSON.stringify(stepsPayload)
      }))
    })

    expect(result.current.steps).toEqual(stepsPayload)
  })

  it('should handle error events', async () => {
    const { result } = renderHook(() => useAiStream())

    // Start streaming to create EventSource
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'test-session' })
    })

    await act(async () => {
      await result.current.startStream({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    // Wait for EventSource to be created
    await waitFor(() => {
      const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
      expect(latestInstance).not.toBeNull()
      mockEventSourceInstance = latestInstance
    })

    const errorMessage = 'Streaming error occurred'

    act(() => {
      const instance = getMockEventSourceInstance()
      instance._triggerEvent('error', new MessageEvent('error', {
        data: JSON.stringify({ message: errorMessage })
      }))
    })

    expect(result.current.error).toBe(errorMessage)
  })

  it('should handle done events', async () => {
    const { result } = renderHook(() => useAiStream())

    // Start streaming to create EventSource
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'test-session' })
    })

    await act(async () => {
      await result.current.startStream({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    // Wait for EventSource to be created
    await waitFor(() => {
      const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
      expect(latestInstance).not.toBeNull()
      mockEventSourceInstance = latestInstance
    })

    act(() => {
      const instance = getMockEventSourceInstance()
      instance._triggerEvent('done', new MessageEvent('done', {
        data: JSON.stringify({})
      }))
    })

    expect(result.current.isStreaming).toBe(false)
  })

  it('should cancel streaming', async () => {
    const { result } = renderHook(() => useAiStream())

    // Start streaming to create EventSource
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'test-session' })
    })

    await act(async () => {
      await result.current.startStream({
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    // Wait for EventSource to be created
    await waitFor(() => {
      const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
      expect(latestInstance).not.toBeNull()
      mockEventSourceInstance = latestInstance
    })

    act(() => {
      result.current.cancel()
    })

    expect(getMockEventSourceInstance().close).toHaveBeenCalled()
  })

  it('should reset state', () => {
    const { result } = renderHook(() => useAiStream())

    // Set some state
    act(() => {
      result.current.reset()
    })

    expect(result.current.text).toBe('')
    expect(result.current.chunks).toEqual([])
    expect(result.current.usage).toBeNull()
    expect(result.current.message).toBeNull()
    expect(result.current.error).toBeNull()
  })

  describe('error payload parsing', () => {
    it('should handle structured error payloads with localization', async () => {
      const { result } = renderHook(() => useAiStream())

      // Start streaming to create EventSource
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'test-session' })
      })

      await act(async () => {
        await result.current.startStream({
          messages: [{ role: 'user', content: 'Hello' }]
        })
      })

      // Wait for EventSource to be created
      await waitFor(() => {
        const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
        expect(latestInstance).not.toBeNull()
        mockEventSourceInstance = latestInstance
      })

      const structuredError = {
        code: 'INSUFFICIENT_CREDITS',
        message: 'OpenRouter credits exhausted. Please add credits to your OpenRouter account.',
        provider: 'openrouter',
        isRetryable: false,
        actionUrl: 'https://openrouter.ai/settings/credits',
        hint: 'Add credits or switch to a different API key/organization.'
      }

      act(() => {
        const instance = getMockEventSourceInstance()
        instance._triggerEvent('error', new MessageEvent('error', {
          data: JSON.stringify(structuredError)
        }))
      })

      // The error should be processed (exact structure depends on localization)
      expect(result.current.error).toBeDefined()
      expect(result.current.error?.code).toBe('INSUFFICIENT_CREDITS')
      expect(result.current.error?.provider).toBe('openrouter')
      expect(result.current.error?.isRetryable).toBe(false)
      expect(result.current.error?.actionUrl).toBe('https://openrouter.ai/settings/credits')
      expect(result.current.error?.hint).toBe('Add credits or switch to a different API key/organization.')
    })

    it('should handle legacy string error payloads', async () => {
      const { result } = renderHook(() => useAiStream())

      // Start streaming to create EventSource
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'test-session' })
      })

      await act(async () => {
        await result.current.startStream({
          messages: [{ role: 'user', content: 'Hello' }]
        })
      })

      // Wait for EventSource to be created
      await waitFor(() => {
        const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
        expect(latestInstance).not.toBeNull()
        mockEventSourceInstance = latestInstance
      })

      const legacyErrorMessage = 'Legacy error message'

      act(() => {
        const instance = getMockEventSourceInstance()
        instance._triggerEvent('error', new MessageEvent('error', {
          data: legacyErrorMessage
        }))
      })

      expect(result.current.error).toEqual({ message: legacyErrorMessage })
    })

    it('should handle partial structured error payloads', async () => {
      const { result } = renderHook(() => useAiStream())

      // Start streaming to create EventSource
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'test-session' })
      })

      await act(async () => {
        await result.current.startStream({
          messages: [{ role: 'user', content: 'Hello' }]
        })
      })

      // Wait for EventSource to be created
      await waitFor(() => {
        const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
        expect(latestInstance).not.toBeNull()
        mockEventSourceInstance = latestInstance
      })

      const partialError = {
        message: 'Rate limit exceeded',
        isRetryable: true
      }

      act(() => {
        const instance = getMockEventSourceInstance()
        instance._triggerEvent('error', new MessageEvent('error', {
          data: JSON.stringify(partialError)
        }))
      })

      expect(result.current.error).toBeDefined()
      expect(result.current.error?.message).toBe('Rate limit exceeded')
      expect(result.current.error?.isRetryable).toBe(true)
    })

    it('should handle invalid error payload gracefully', async () => {
      const { result } = renderHook(() => useAiStream())

      // Start streaming to create EventSource
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'test-session' })
      })

      await act(async () => {
        await result.current.startStream({
          messages: [{ role: 'user', content: 'Hello' }]
        })
      })

      // Wait for EventSource to be created
      await waitFor(() => {
        const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
        expect(latestInstance).not.toBeNull()
        mockEventSourceInstance = latestInstance
      })

      act(() => {
        const instance = getMockEventSourceInstance()
        instance._triggerEvent('error', new MessageEvent('error', {
          data: null
        }))
      })

      expect(result.current.error).toEqual({ message: 'An unknown error occurred' })
    })
  })
})
