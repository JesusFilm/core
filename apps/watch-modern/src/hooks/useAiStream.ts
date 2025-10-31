import { useCallback, useRef, useState } from 'react'
import type { CoreMessage } from 'ai'
import { useEventSource, type SSEEvent } from './useEventSource'

const isDebugLoggingEnabled = process.env.NODE_ENV !== 'production'

const debugLog = (...args: unknown[]) => {
  if (isDebugLoggingEnabled) {
    console.log(...args)
  }
}

export interface AiStreamOptions {
  provider?: 'openrouter' | 'apologist'
  model?: string
  messages?: CoreMessage[]
  input?: string
  mode?: 'default' | 'conversation'
  temperature?: number
  top_p?: number
  max_output_tokens?: number
  max_tokens?: number
  cache_ttl?: number
  response_format?: unknown
  metadata?: unknown
  store?: boolean
  parallel_tool_calls?: boolean
  previous_response_id?: string
  instructions?: string
  user?: string
  reasoning?: {
    effort?: string
  }
}

export interface AiStreamChunk {
  text: string
  timestamp: number
}

export interface AiUsage {
  input_tokens: number
  output_tokens: number
  total_tokens: number
}

export interface AiMessage {
  id: string
  type: 'message'
  role: 'assistant'
  content: Array<{
    type: 'output_text'
    text: string
  }>
}

export interface UseAiStreamReturn {
  /** Whether streaming is active */
  isStreaming: boolean
  /** Accumulated text from all chunks */
  text: string
  /** Individual text chunks received */
  chunks: AiStreamChunk[]
  /** Usage statistics when available */
  usage: AiUsage | null
  /** Final message object when complete */
  message: AiMessage | null
  /** Latest conversation map payload when provided */
  conversationMap: unknown
  /** Latest structured steps payload when provided */
  steps: unknown
  /** Current error if any */
  error: string | null
  /** Start a new streaming request */
  startStream: (options: AiStreamOptions) => Promise<void>
  /** Cancel the current stream */
  cancel: () => void
  /** Reset the stream state */
  reset: () => void
}

/**
 * Hook for streaming AI responses via Server-Sent Events
 * Manages session creation and SSE connection lifecycle
 */
export function useAiStream(): UseAiStreamReturn {
  const [isStreaming, setIsStreaming] = useState(false)
  const [text, setText] = useState('')
  const [chunks, setChunks] = useState<AiStreamChunk[]>([])
  const [usage, setUsage] = useState<AiUsage | null>(null)
  const [message, setMessage] = useState<AiMessage | null>(null)
  const [conversationMap, setConversationMap] = useState<unknown>(null)
  const [steps, setSteps] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)

  const [eventSourceUrl, setEventSourceUrl] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Event handlers for SSE events
  const handleEvent = useCallback((event: SSEEvent) => {
    debugLog('[useAiStream] Received event:', event.type, event.data)
    switch (event.type) {
      case 'open': {
        const sessionId = event.data && typeof event.data === 'object' ? event.data.id : undefined
        if (sessionId) {
          debugLog('[useAiStream] Stream opened with session:', sessionId)
        } else {
          debugLog('[useAiStream] Stream opened without session payload')
        }
        break
      }

      case 'delta':
        if (event.data?.text) {
          debugLog('[useAiStream] Processing delta:', event.data.text)
          setText(prev => {
            const newText = prev + event.data.text
            debugLog('[useAiStream] Updated text to:', newText)
            return newText
          })
          setChunks(prev => [...prev, {
            text: event.data.text,
            timestamp: Date.now()
          }])
        } else {
          debugLog('[useAiStream] Received delta event without text payload, ignoring.')
        }
        break

      case 'usage':
        if (event.data) {
          setUsage(event.data)
        }
        break

      case 'message':
        if (event.data) {
          setMessage(event.data)
        }
        break

      case 'conversation':
        setConversationMap(event.data ?? null)
        break

      case 'steps':
        setSteps(event.data ?? null)
        break

      case 'error': {
        const errorMessage = event.data?.message
        if (errorMessage) {
          setError(errorMessage)
        } else {
          debugLog('[useAiStream] Ignoring error event without message payload')
        }
        setIsStreaming(false)
        break
      }

      case 'done':
        setIsStreaming(false)
        debugLog('[useAiStream] Stream completed')
        break
    }
  }, [])

  // SSE connection
  const { close } = useEventSource({
    url: eventSourceUrl,
    onEvent: {
      open: handleEvent,
      delta: handleEvent,
      usage: handleEvent,
      conversation: handleEvent,
      steps: handleEvent,
      message: handleEvent,
      error: handleEvent,
      done: handleEvent
    },
    autoReconnect: false // We'll handle reconnection manually
  })

  const startStream = useCallback(async (options: AiStreamOptions) => {
    debugLog('[useAiStream] Starting stream with options:', options)
    // Reset state but don't cancel existing connections yet
    setText('')
    setChunks([])
    setUsage(null)
    setMessage(null)
    setConversationMap(null)
    setSteps(null)
    setError(null)
    setEventSourceUrl(null)

    setIsStreaming(true)

    try {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController()

      // Create streaming session
      debugLog('[useAiStream] Creating session...')
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create streaming session')
      }

      const { id } = await response.json()

      debugLog('[useAiStream] Created streaming session:', id, 'Setting EventSource URL to:', `/api/ai/stream?id=${id}`)
      setEventSourceUrl(`/api/ai/stream?id=${id}`)

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        debugLog('[useAiStream] Stream creation cancelled')
        return
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to start streaming'
      setError(errorMessage)
      setIsStreaming(false)
      console.error('[useAiStream] Failed to create session:', err)
    }
  }, [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    close()
    setIsStreaming(false)
    debugLog('[useAiStream] Stream cancelled')
  }, [close])

  const reset = useCallback(() => {
    cancel()
    setText('')
    setChunks([])
    setUsage(null)
    setMessage(null)
    setError(null)
    setEventSourceUrl(null)
  }, [cancel])

  return {
    isStreaming,
    text,
    chunks,
    usage,
    message,
    conversationMap,
    steps,
    error,
    startStream,
    cancel,
    reset
  }
}
