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

import { useJourneyAiContext } from '../../libs/JourneyAiContextProvider'
import { useJourney } from '../../libs/JourneyProvider'
import { Actions } from '../Actions'
import { Conversation } from '../Conversation'
import { Message } from '../Message'
import { PromptInput } from '../PromptInput'
import { Response } from '../Response'
import { SuggestionsList } from '../Suggestion'

import { InteractionStarter, InteractionType } from './InteractionStarter'
import { getActiveBlockContext } from './utils/contextExtraction'

interface AiChatProps {
  activeBlockId?: string
  userId?: string
  /** When provided, this message is sent automatically on first render */
  initialMessage?: string
}

const followUpSuggestions = [
  'Tell me more',
  'What does the Bible say?',
  'How can I apply this?'
]

function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

export function AiChat({ activeBlockId, userId, initialMessage }: AiChatProps): ReactElement {
  const { journey } = useJourney()
  const { aiContextData } = useJourneyAiContext()
  const [input, setInput] = useState('')
  const initialMessageSent = useRef(false)

  const contextText = useMemo(
    () => getActiveBlockContext(activeBlockId, aiContextData),
    [activeBlockId, aiContextData]
  )

  const languageBcp47 = journey?.language?.bcp47 ?? undefined

  const sessionId = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const existing = window.sessionStorage.getItem('ai-chat-session-id')
    if (existing != null) return existing
    const id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    window.sessionStorage.setItem('ai-chat-session-id', id)
    return id
  }, [])

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: {
          contextText,
          language: languageBcp47,
          journeyId: journey?.id,
          userId,
          sessionId
        }
      }),
    [contextText, languageBcp47, journey?.id, userId, sessionId]
  )

  const { messages, sendMessage, regenerate, stop, status } = useChat({
    transport
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

  const handleInteractionSelect = useCallback(
    (_type: InteractionType, prompt: string) => {
      void sendMessage({ text: prompt })
    },
    [sendMessage]
  )

  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      void sendMessage({ text: suggestion })
    },
    [sendMessage]
  )

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

  const showInteractionStarters = messages.length === 0

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
        {showInteractionStarters && (
          <InteractionStarter onSelect={handleInteractionSelect} />
        )}
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

      {!isLoading && messages.length > 0 && (
        <SuggestionsList
          suggestions={followUpSuggestions}
          onSelect={handleSuggestionSelect}
        />
      )}

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
