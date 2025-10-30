import { renderHook, act, waitFor } from '@testing-library/react'
import { useEventSource } from './useEventSource'

type EventListener = (event: Event) => void

// Mock EventSource
const mockEventSource = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn(),
  dispatchEvent: jest.fn(),
  onerror: null as ((event: Event) => void) | null,
  onopen: null as ((event: Event) => void) | null
}

// Create a more realistic mock that actually calls event listeners
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
    // Helper method to trigger events in tests
    _triggerEvent: (eventType: string, event: Event) => {
      listeners[eventType]?.forEach(listener => listener(event))
    }
  }
}

global.EventSource = jest.fn().mockImplementation(createMockEventSource)

describe('useEventSource', () => {
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

  it('should not connect when url is null', () => {
    renderHook(() => useEventSource({ url: null }))

    expect(global.EventSource).not.toHaveBeenCalled()
  })

  it('should connect when url is provided', () => {
    const url = 'http://example.com/stream'
    renderHook(() => useEventSource({ url }))

    expect(global.EventSource).toHaveBeenCalledWith(url)
  })

  it('should handle open event', async () => {
    const { result } = renderHook(() => useEventSource({ url: 'http://example.com/stream' }))

    expect(result.current.status).toBe('connecting')

    // Get the mock instance and simulate open event
    await waitFor(() => {
      const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
      expect(latestInstance).not.toBeNull()
      mockEventSourceInstance = latestInstance
    })

    act(() => {
      getMockEventSourceInstance()._triggerEvent('open', new Event('open'))
    })

    expect(result.current.status).toBe('connected')
  })

  it('should handle error event', async () => {
    const { result } = renderHook(() => useEventSource({ url: 'http://example.com/stream' }))

    expect(result.current.status).toBe('connecting')

    // Get the mock instance and simulate error event
    await waitFor(() => {
      const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
      expect(latestInstance).not.toBeNull()
      mockEventSourceInstance = latestInstance
    })

    const errorEvent = new Event('error')
    act(() => {
      getMockEventSourceInstance()._triggerEvent('error', errorEvent)
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe(errorEvent)
  })

  it('should dispatch custom events', async () => {
    const onDelta = jest.fn()
    const onDone = jest.fn()

    renderHook(() =>
      useEventSource({
        url: 'http://example.com/stream',
        onEvent: {
          delta: onDelta,
          done: onDone
        }
      })
    )

    // Wait for EventSource to be created
    await waitFor(() => {
      const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
      expect(latestInstance).not.toBeNull()
      mockEventSourceInstance = latestInstance
    })

    // Simulate custom events
    const deltaEvent = new MessageEvent('delta', {
      data: JSON.stringify({ text: 'hello' })
    })

    const doneEvent = new MessageEvent('done', {
      data: JSON.stringify({})
    })

    act(() => {
      const instance = getMockEventSourceInstance()
      instance._triggerEvent('delta', deltaEvent)
      instance._triggerEvent('done', doneEvent)
    })

    expect(onDelta).toHaveBeenCalledWith({
      type: 'delta',
      data: { text: 'hello' }
    })
    expect(onDone).toHaveBeenCalledWith({
      type: 'done',
      data: {}
    })
  })

  it('should close connection when close is called', async () => {
    const { result } = renderHook(() => useEventSource({ url: 'http://example.com/stream' }))

    // Wait for EventSource to be created
    await waitFor(() => {
      const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
      expect(latestInstance).not.toBeNull()
      mockEventSourceInstance = latestInstance
    })

    act(() => {
      result.current.close()
    })

    expect(getMockEventSourceInstance().close).toHaveBeenCalled()
    expect(result.current.status).toBe('closed')
  })

  it('should reconnect when reconnect is called', async () => {
    const { result } = renderHook(() => useEventSource({ url: 'http://example.com/stream' }))

    // Wait for initial EventSource to be created
    await waitFor(() => {
      const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
      expect(latestInstance).not.toBeNull()
      mockEventSourceInstance = latestInstance
    })

    act(() => {
      result.current.reconnect()
    })

    expect(global.EventSource).toHaveBeenCalledTimes(2)
  })

  it('should handle malformed JSON in events gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const onEvent = jest.fn()

    renderHook(() =>
      useEventSource({
        url: 'http://example.com/stream',
        onEvent: { delta: onEvent }
      })
    )

    // Wait for EventSource to be created
    await waitFor(() => {
      const latestInstance = (global.EventSource as jest.Mock).mock.results[0]?.value ?? null
      expect(latestInstance).not.toBeNull()
      mockEventSourceInstance = latestInstance
    })

    const malformedEvent = new MessageEvent('delta', {
      data: 'invalid json'
    })

    act(() => {
      getMockEventSourceInstance()._triggerEvent('delta', malformedEvent)
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      '[useEventSource] Failed to parse SSE event data:',
      'invalid json',
      expect.any(SyntaxError)
    )
    expect(onEvent).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})
