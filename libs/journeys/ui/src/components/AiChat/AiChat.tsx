'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, UIMessage } from 'ai'
import {
  FormEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import { useJourney } from '../../libs/JourneyProvider'
import { Actions } from '../Actions'
import { Conversation } from '../Conversation'
import { Message } from '../Message'
import { PromptInput } from '../PromptInput'
import { Response } from '../Response'

interface AiChatProps {
  userId?: string
  /** When provided, this message is sent automatically on first render */
  initialMessage?: string
}

function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

export function AiChat({ userId, initialMessage }: AiChatProps): ReactElement {
  const { journey } = useJourney()
  const [input, setInput] = useState('')
  const initialMessageSent = useRef(false)

  const languageBcp47 = journey?.language?.bcp47 ?? undefined

  const sessionId = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const existing = window.sessionStorage.getItem('ai-chat-session-id')
    if (existing != null) return existing
    const id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    window.sessionStorage.setItem('ai-chat-session-id', id)
    return id
  }, [])

  // Keep a ref of the latest body fields so the transport's body resolver
  // reads the current value at send time.
  const bodyStateRef = useRef({
    languageBcp47,
    journeyId: journey?.id,
    userId,
    sessionId
  })
  bodyStateRef.current = {
    languageBcp47,
    journeyId: journey?.id,
    userId,
    sessionId
  }

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: () => {
          const latest = bodyStateRef.current
          console.log(
            '[apologist:client] sending chat body language=',
            latest.languageBcp47,
            'journeyId=',
            latest.journeyId,
            'sessionId=',
            latest.sessionId
          )
          return {
            language: latest.languageBcp47,
            journeyId: latest.journeyId,
            userId: latest.userId,
            sessionId: latest.sessionId
          }
        },
        // Custom fetch wrapper logs response status/headers so we can see
        // whether the /api/chat endpoint is emitting the AI SDK Data Stream
        // Protocol (x-vercel-ai-ui-message-stream header should be present).
        fetch: async (input, init) => {
          console.log('[apologist:client] fetch start url=', input)
          const response = await fetch(input, init)
          try {
            const headerDump: Record<string, string> = {}
            response.headers.forEach((value, key) => {
              headerDump[key] = value
            })
            console.log(
              '[apologist:client] fetch response status=',
              response.status,
              'content-type=',
              response.headers.get('content-type'),
              'x-vercel-ai-data-stream=',
              response.headers.get('x-vercel-ai-data-stream'),
              'x-vercel-ai-ui-message-stream=',
              response.headers.get('x-vercel-ai-ui-message-stream'),
              'all-headers=',
              headerDump
            )
          } catch (err) {
            console.error(
              '[apologist:client] fetch response header read error',
              err
            )
          }
          return response
        }
      }),
    // Body is read from bodyStateRef.current at send time, so the
    // transport does not need to be rebuilt on every body change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const { messages, sendMessage, regenerate, stop, status } = useChat({
    transport,
    onFinish: ({ message }) => {
      const text = getTextFromMessage(message)
      console.log(
        '[apologist:client] useChat onFinish role=',
        message.role,
        'id=',
        message.id,
        'partCount=',
        message.parts?.length ?? 0,
        'text.length=',
        text.length
      )
    },
    onError: (error) => {
      console.error(
        '[apologist:client] useChat onError message=',
        error?.message,
        'stack=',
        error?.stack,
        'raw=',
        error
      )
    },
    onData: (data) => {
      console.log('[apologist:client] useChat onData part=', data)
    }
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  // Auto-send initialMessage on first render (used by LastCardChatBar)
  useEffect(() => {
    if (
      initialMessage != null &&
      initialMessage.trim().length > 0 &&
      !initialMessageSent.current
    ) {
      initialMessageSent.current = true
      void sendMessage({ text: initialMessage })
    }
  }, [initialMessage, sendMessage])

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      if (input.trim().length === 0 || isLoading) return
      void sendMessage({ text: input })
      setInput('')
    },
    [input, isLoading, sendMessage]
  )

  const lastAssistantIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i
    }
    return -1
  }, [messages])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0
      }}
    >
      <Conversation>
        {messages.map((message, index) => {
          const text = getTextFromMessage(message)
          return (
            <div key={message.id}>
              <Message role={message.role as 'user' | 'assistant'}>
                {message.role === 'assistant' ? (
                  <Response content={text} />
                ) : (
                  text
                )}
              </Message>
              {message.role === 'assistant' && text.length > 0 && (
                <Actions
                  content={text}
                  onRegenerate={() => {
                    void regenerate()
                  }}
                  isLastAssistantMessage={index === lastAssistantIndex}
                />
              )}
            </div>
          )
        })}
        {isLoading &&
          (messages.length === 0 ||
            messages[messages.length - 1]?.role === 'user') && (
            <Message role="assistant">
              <span style={{ opacity: 0.5 }}>Thinking...</span>
            </Message>
          )}
      </Conversation>

      <PromptInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onStop={stop}
      />
    </div>
  )
}
