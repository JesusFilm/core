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
  /** When provided, this message is sent automatically on first render */
  initialMessage?: string
}

function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: 'text'; text: string } => part.type === 'text'
    )
    .map((part) => part.text)
    .join('')
}

export function AiChat({ initialMessage }: AiChatProps): ReactElement {
  const { journey } = useJourney()
  const [input, setInput] = useState('')
  const initialMessageSent = useRef(false)

  const languageBcp47 = journey?.language?.bcp47 ?? undefined
  const languageRef = useRef(languageBcp47)
  languageRef.current = languageBcp47

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: () => ({ language: languageRef.current })
      }),
    []
  )

  const { messages, sendMessage, regenerate, stop, status } = useChat({
    transport
  })

  const isLoading = status === 'submitted' || status === 'streaming'

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
