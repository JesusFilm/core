'use client'

import { useChat } from '@ai-sdk/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { DefaultChatTransport, UIMessage } from 'ai'
import { useTranslation } from 'next-i18next/pages'
import {
  FormEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useJourney } from '../../libs/JourneyProvider'
import { Actions } from '../Actions'
import { Conversation } from '../Conversation'
import { Message } from '../Message'
import { PromptInput } from '../PromptInput'
import { Response } from '../Response'

import { ChatHeader } from './ChatHeader'
import { DragHandle } from './DragHandle'
import { HEADER_WASH } from './tokens'

interface AiChatProps {
  /** When provided, this message is sent automatically on first render */
  initialMessage?: string
  /**
   * When true (default) the chat shows inline collapse controls — a drag
   * handle on mobile. Callers that wrap AiChat in their own dismissible
   * container (e.g. a Drawer with its own close button) should pass false.
   */
  collapsible?: boolean
  /**
   * `panel` (default) renders the bubble layout for the pinned mobile bar
   * (header + drag handle + bubbles + capsule input). `overlay` renders
   * plain assistant prose and a floating capsule input for the desktop
   * ambient overlay.
   */
  variant?: 'panel' | 'overlay'
  /**
   * Notifies the parent when the active vs idle state changes. The pinned
   * sheet uses this to switch between auto-height (idle) and 80% height
   * (active) per the design spec.
   */
  onActiveChange?: (active: boolean) => void
}

function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: 'text'; text: string } => part.type === 'text'
    )
    .map((part) => part.text)
    .join('')
}

const TYPEWRITER_CHARS_PER_SEC = 280

interface TypewriterResult {
  display: string
  isComplete: boolean
}

function useTypewriter(
  target: string,
  enabled: boolean,
  isStreaming: boolean
): TypewriterResult {
  const [revealed, setRevealed] = useState(() => (enabled ? 0 : target.length))
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
  surface?: 'light' | 'dark'
}

function AssistantBubble({
  text,
  animate,
  isStreaming,
  surface = 'light'
}: AssistantBubbleProps): ReactElement {
  const { display, isComplete } = useTypewriter(text, animate, isStreaming)
  return (
    <>
      <Message role="assistant" plain surface={surface}>
        <Response content={display} />
      </Message>
      {isComplete && text.length > 0 && <Actions content={text} plain />}
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

export function AiChat({
  initialMessage,
  collapsible = true,
  variant = 'panel',
  onActiveChange
}: AiChatProps): ReactElement {
  const isOverlay = variant === 'overlay'
  const isPanel = !isOverlay
  const { t } = useTranslation('libs-journeys-ui')
  const { journey } = useJourney()
  const [input, setInput] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const initialMessageSent = useRef(false)

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  const handleCollapse = useCallback(() => {
    setCollapsed(true)
  }, [])

  const languageBcp47 = journey?.language?.bcp47 ?? undefined
  const languageRef = useRef(languageBcp47)
  languageRef.current = languageBcp47

  const journeyId = journey?.id
  const journeyIdRef = useRef(journeyId)
  journeyIdRef.current = journeyId

  const [sessionId] = useState<string | undefined>(() => {
    if (typeof window === 'undefined') return undefined
    const existing = window.sessionStorage.getItem('aiChat.sessionId')
    if (existing != null && existing.length > 0) return existing
    const fresh = uuidv4()
    window.sessionStorage.setItem('aiChat.sessionId', fresh)
    return fresh
  })
  const sessionIdRef = useRef(sessionId)
  sessionIdRef.current = sessionId

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: () => ({
          language: languageRef.current,
          sessionId: sessionIdRef.current,
          journeyId: journeyIdRef.current
        })
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
    setCollapsed(false)
    void regenerate()
  }, [regenerate])

  useEffect(() => {
    if (
      initialMessage != null &&
      initialMessage.trim().length > 0 &&
      !initialMessageSent.current
    ) {
      initialMessageSent.current = true
      setCollapsed(false)
      void sendMessage({ text: initialMessage })
    }
  }, [initialMessage, sendMessage])

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      if (input.trim().length === 0 || isLoading) return
      setCollapsed(false)
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

  // Active = has messages and user has not collapsed back to idle.
  const isActive = messages.length > 0 && !collapsed
  useEffect(() => {
    onActiveChange?.(isActive)
  }, [isActive, onActiveChange])

  const showDragHandle = isPanel && collapsible
  const showHeader = isPanel

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        position: 'relative'
      }}
    >
      {(showDragHandle || showHeader) && (
        <Box sx={{ background: HEADER_WASH, flexShrink: 0 }}>
          {showDragHandle && (
            <DragHandle
              collapsed={collapsed}
              onToggle={handleToggleCollapse}
              onCollapse={handleCollapse}
            />
          )}
          {showHeader && <ChatHeader />}
        </Box>
      )}

      <Box
        sx={{
          display: collapsed ? 'none' : 'flex',
          flex: 1,
          flexDirection: 'column',
          minHeight: 0,
          width: '100%',
          maxWidth: { xs: 'none', sm: '48rem' },
          mx: 'auto'
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
                    surface={isOverlay ? 'dark' : 'light'}
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
              <Message
                role="assistant"
                plain
                surface={isOverlay ? 'dark' : 'light'}
              >
                <TypingIndicator />
              </Message>
            )}
          {error != null && !isLoading && (
            <Box>
              <Message
                role="assistant"
                plain
                surface={isOverlay ? 'dark' : 'light'}
              >
                <Box component="span" sx={{ opacity: 0.7 }}>
                  {t('Something went wrong. Please try again.')}
                </Box>
              </Message>
              <Box sx={{ display: 'flex', px: 2, py: 0.25 }}>
                <Button
                  size="small"
                  onClick={handleRetry}
                  aria-label={t('Retry')}
                  sx={{
                    fontSize: 12,
                    color: isOverlay
                      ? 'rgba(255, 255, 255, 0.7)'
                      : 'text.secondary',
                    minWidth: 0
                  }}
                >
                  {t('Retry')}
                </Button>
              </Box>
            </Box>
          )}
        </Conversation>
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: 'none', sm: '48rem' },
          mx: 'auto',
          px: isOverlay ? { xs: 0, sm: 1 } : 0,
          pb: isOverlay ? { xs: 0, sm: 1 } : 0,
          pt: isOverlay ? { xs: 0, sm: 0.5 } : 0
        }}
      >
        <PromptInput
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onStop={stop}
          variant={isOverlay ? 'floating' : 'inline'}
          showTopBorder={messages.length > 0}
        />
      </Box>
    </Box>
  )
}
