import { useCallback, useEffect, useRef, useState } from 'react'

const isDebugLoggingEnabled = process.env.NODE_ENV !== 'production'

const debugLog = (...args: unknown[]) => {
  if (isDebugLoggingEnabled) {
    console.log(...args)
  }
}

export type SSEEventType =
  | 'open'
  | 'delta'
  | 'usage'
  | 'message'
  | 'conversation'
  | 'steps'
  | 'error'
  | 'done'

export interface SSEEvent<T = unknown> {
  type: SSEEventType
  data: T
}

export interface UseEventSourceOptions {
  /** URL to connect to */
  url?: string | null
  /** Event handlers for specific event types */
  onEvent?: Partial<Record<SSEEventType, (event: SSEEvent) => void>>
  /** Whether to automatically reconnect on error */
  autoReconnect?: boolean
  /** Reconnection delay in milliseconds */
  reconnectDelay?: number
  /** Maximum number of reconnection attempts */
  maxReconnectAttempts?: number
}

export interface UseEventSourceReturn {
  /** Current connection status */
  status: 'idle' | 'connecting' | 'connected' | 'error' | 'closed'
  /** Last error if any */
  error: Event | null
  /** Close the connection */
  close: () => void
  /** Reconnect manually */
  reconnect: () => void
}

/**
 * Generic hook for consuming Server-Sent Events
 * Handles connection lifecycle, error recovery, and event dispatching
 */
export function useEventSource(options: UseEventSourceOptions): UseEventSourceReturn {
  const {
    url,
    onEvent,
    autoReconnect = false,
    reconnectDelay = 1000,
    maxReconnectAttempts = 3
  } = options

  debugLog('[useEventSource] URL:', url, 'autoReconnect:', autoReconnect)

  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error' | 'closed'>('idle')
  const [error, setError] = useState<Event | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    debugLog('[useEventSource] connect() called - url:', url)
    if (!url) {
      debugLog('[useEventSource] No URL, skipping connect')
      return
    }

    debugLog('[useEventSource] Starting connection to:', url)
    cleanup()
    setStatus('connecting')
    setError(null)

    try {
      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      // Handle connection open
      eventSource.onopen = () => {
        debugLog('[useEventSource] EventSource onopen fired')
        setStatus('connected')
        reconnectAttemptsRef.current = 0
        debugLog('[useEventSource] Connected to', url)
      }

      // Handle connection error
      eventSource.onerror = (event) => {
        const readyState = eventSource.readyState

        // Browsers fire onerror when the stream closes normally. Treat that as a clean close.
        if (readyState === EventSource.CLOSED) {
          debugLog('[useEventSource] Stream closed by server')
          cleanup()
          setStatus('closed')
          setError(null)
          return
        }

        setStatus('error')
        setError(event)
        console.error('[useEventSource] Connection error:', event)

        cleanup()

        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          debugLog(`[useEventSource] Reconnecting in ${reconnectDelay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectDelay)
        }
      }

      // Handle custom events
      const eventTypes: SSEEventType[] = ['open', 'delta', 'usage', 'message', 'conversation', 'steps', 'error', 'done']

      eventTypes.forEach(eventType => {
        eventSource.addEventListener(eventType, (event: MessageEvent) => {
          debugLog('[useEventSource] Custom event received:', eventType, 'data:', event.data)
          if (!event.data) {
            if (eventType === 'error') {
              debugLog('[useEventSource] Ignoring empty SSE error payload')
              return
            }

            onEventRef.current?.[eventType]?.({ type: eventType, data: null })
            if (eventType === 'done') {
              debugLog('[useEventSource] Stream completed (empty payload)')
              setStatus('closed')
            }
            return
          }

          try {
            const data = JSON.parse(event.data)
            const sseEvent: SSEEvent = { type: eventType, data }

            // Call specific event handler if provided
            onEventRef.current?.[eventType]?.(sseEvent)

            // Log important events
            if (eventType === 'error') {
              console.error('[useEventSource] SSE error event:', data)
            } else if (eventType === 'done') {
              debugLog('[useEventSource] Stream completed')
              setStatus('closed')
            }
          } catch (parseError) {
            console.error('[useEventSource] Failed to parse SSE event data:', event.data, parseError)
          }
        })
      })

    } catch (connectionError) {
      setStatus('error')
      setError(connectionError as Event)
      console.error('[useEventSource] Failed to create EventSource:', connectionError)
    }
  }, [autoReconnect, reconnectDelay, maxReconnectAttempts, cleanup, url])

  const close = useCallback(() => {
    cleanup()
    setStatus('closed')
    debugLog('[useEventSource] Connection closed manually')
  }, [cleanup])

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0
    connect()
  }, [connect])

  // Connect when URL changes
  useEffect(() => {
    debugLog('[useEventSource] useEffect triggered - url:', url, 'status:', status)
    if (url) {
      debugLog('[useEventSource] URL present, calling connect()')
      connect()
    } else {
      debugLog('[useEventSource] No URL, setting idle')
      cleanup()
      setStatus('idle')
    }

    return cleanup
  }, [url, connect, cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    status,
    error,
    close,
    reconnect
  }
}
