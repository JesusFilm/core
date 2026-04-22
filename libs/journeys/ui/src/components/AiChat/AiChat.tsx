'use client'

import { useChat } from '@ai-sdk/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { DefaultChatTransport, UIMessage } from 'ai'
import { useTranslation } from 'next-i18next'
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

const TYPEWRITER_CHARS_PER_SEC = 200

interface TypewriterResult {
  display: string
  isComplete: boolean
}

function useTypewriter(
  target: string,
  enabled: boolean,
  isStreaming: boolean
): TypewriterResult {
  const [revealed, setRevealed] = useState(() =>
    enabled ? 0 : target.length
  )
  const targetRef = useRef(target)
  targetRef.current = target

  useEffect(() => {
    if (!enabled) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number): void => {
      const deltaSec = (now - last) / 1000
      last = now
      setRevealed((prev) => {
        const targetLength = targetRef.current.length
        if (prev >= targetLength) return prev
        const step = Math.max(
          1,
          Math.floor(TYPEWRITER_CHARS_PER_SEC * deltaSec)
        )
        return Math.min(targetLength, prev + step)
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [enabled])

  if (!enabled) return { display: target, isComplete: true }
  const display = target.slice(0, Math.min(revealed, target.length))
  const isComplete = !isStreaming && revealed >= target.length
  return { display, isComplete }
}

interface AssistantBubbleProps {
  text: string
  animate: boolean
  isStreaming: boolean
}

function AssistantBubble({
  text,
  animate,
  isStreaming
}: AssistantBubbleProps): ReactElement {
  const { display, isComplete } = useTypewriter(text, animate, isStreaming)
  return (
    <>
      <Message role="assistant">
        <Response content={display} />
      </Message>
      {isComplete && text.length > 0 && <Actions content={text} />}
    </>
  )
}

function TypingIndicator(): ReactElement {
  return (
    <Box
      aria-label="Assistant is typing"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        py: 0.5,
        '@keyframes aiChatTypingBounce': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: 0.35 },
          '30%': { transform: 'translateY(-4px)', opacity: 1 }
        }
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          component="span"
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: 'text.secondary',
            animation: 'aiChatTypingBounce 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.16}s`
          }}
        />
      ))}
    </Box>
  )
}

export function AiChat({ initialMessage }: AiChatProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
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

  const { messages, sendMessage, regenerate, stop, status, error } = useChat({
    transport,
    onError: (err) => {
      console.error('[AiChat] useChat onError', {
        name: err?.name,
        message: err?.message,
        cause: (err as { cause?: unknown })?.cause
      })
    }
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  const handleRetry = useCallback(() => {
    void regenerate()
  }, [regenerate])

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0
      }}
    >
      <Conversation>
        {messages.map((message, index) => {
          const text = getTextFromMessage(message)
          const isLast = index === lastAssistantIndex
          return (
            <Box key={message.id}>
              {message.role === 'assistant' ? (
                <AssistantBubble
                  text={text}
                  animate={isLast}
                  isStreaming={isLast && isLoading}
                />
              ) : (
                <Message role="user">{text}</Message>
              )}
            </Box>
          )
        })}
        {isLoading &&
          (messages.length === 0 ||
            messages[messages.length - 1]?.role === 'user') && (
            <Message role="assistant">
              <TypingIndicator />
            </Message>
          )}
        {error != null && !isLoading && (
          <Box>
            <Message role="assistant">
              <Box component="span" sx={{ opacity: 0.7 }}>
                {t('Something went wrong. Please try again.')}
              </Box>
            </Message>
            <Box sx={{ display: 'flex', px: 2, py: 0.25 }}>
              <Button
                size="small"
                onClick={handleRetry}
                aria-label={t('Retry')}
                sx={{ fontSize: 12, color: 'text.secondary', minWidth: 0 }}
              >
                {t('Retry')}
              </Button>
            </Box>
          </Box>
        )}
      </Conversation>

      <PromptInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onStop={stop}
      />
    </Box>
  )
}
