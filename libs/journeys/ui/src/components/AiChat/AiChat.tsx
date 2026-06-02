'use client'

import { useChat } from '@ai-sdk/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
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
import {
  HEADER_WASH,
  MUTED_FG,
  OVERLAY_FG_RETRY,
  OVERLAY_HERO_FG,
  SHEET_BOTTOM_FADE
} from './chatStyles'
import { DragHandle } from './DragHandle'

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
   * Notifies the parent when the sheet's logical state changes:
   *  - 'idle' — no messages yet, sheet expanded; show header + input.
   *  - 'active' — messages present, sheet expanded; full conversation.
   *  - 'collapsed' — user has dragged the sheet down; only the drag
   *    handle is shown over the journey card. Reachable from either
   *    idle or active.
   *
   * The pinned sheet uses this to choose the right height + animation.
   */
  onSheetStateChange?: (state: 'idle' | 'active' | 'collapsed') => void
  /**
   * Seeds the internal `collapsed` state on mount. Used by per-card
   * `expandChatByDefault: false / null` to land the user in the
   * drag-handle-only state instead of the default idle (input visible)
   * state. Only the initial mount value matters — subsequent changes
   * are ignored, drag interactions own the state from there.
   */
  initialCollapsed?: boolean
}

export type AiChatSheetState = 'idle' | 'active' | 'collapsed'

function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: 'text'; text: string } => part.type === 'text'
    )
    .map((part) => part.text)
    .join('')
}

// AI SDK v6's HttpChatTransport discards the HTTP status on a non-2xx response
// and throws `new Error(await response.text())`, so the only signal the client
// gets is the response *body*. The server (apps/journeys/pages/api/chat) tags
// its deterministic failures with a structured `code`; we read it back out
// here. Transient failures (network drop, upstream 5xx, mid-stream abort)
// arrive as non-JSON messages → no code → treated as retriable.
function parseChatErrorCode(error: Error | undefined): string | undefined {
  if (error?.message == null) return undefined
  try {
    const parsed = JSON.parse(error.message) as { code?: unknown }
    return typeof parsed.code === 'string' ? parsed.code : undefined
  } catch {
    return undefined
  }
}

// Codes whose retry would deterministically fail again — re-firing wastes a
// request and, for the cap-hit, re-sends a max-size prompt. Retry is hidden
// for these and shown for everything else (transient / unknown).
const NON_RETRIABLE_CHAT_ERROR_CODES = new Set([
  'conversation_capped',
  'invalid_request',
  'not_found'
])

const CONVERSATION_CAPPED_CODE = 'conversation_capped'

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
  // Assistant always renders as plain prose (no bubble); only the
  // text colour shifts between light and dark surfaces. Actions still
  // tints itself to the surface via `plain`.
  const isDark = surface === 'dark'
  return (
    <>
      <Message role="assistant" plain surface={surface}>
        <Response content={display} />
      </Message>
      {isComplete && text.length > 0 && (
        <Actions content={text} plain={isDark} />
      )}
    </>
  )
}

function TypingIndicator(): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  return (
    <Box
      aria-label={t('Assistant is typing')}
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
            bgcolor: MUTED_FG,
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
  onSheetStateChange,
  initialCollapsed = false
}: AiChatProps): ReactElement {
  const isOverlay = variant === 'overlay'
  const isPanel = !isOverlay
  const { t } = useTranslation('libs-journeys-ui')
  const { journey } = useJourney()
  const [input, setInput] = useState('')
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const initialMessageSent = useRef(false)

  const handleCollapse = useCallback(() => {
    setCollapsed(true)
  }, [])

  const handleExpand = useCallback(() => {
    setCollapsed(false)
  }, [])

  const languageBcp47 = journey?.language?.bcp47 ?? undefined
  const languageRef = useRef(languageBcp47)
  languageRef.current = languageBcp47

  const journeyId = journey?.id
  const journeyIdRef = useRef(journeyId)
  journeyIdRef.current = journeyId

  const [sessionId, setSessionId] = useState<string | undefined>(() => {
    if (typeof window === 'undefined') return undefined
    // sessionStorage can throw in Safari private mode, sandboxed
    // iframes, and quota-exceeded states. Fall back to a fresh UUID
    // so the chat surface still mounts.
    try {
      const existing = window.sessionStorage.getItem('aiChat.sessionId')
      if (existing != null && existing.length > 0) return existing
      const fresh = uuidv4()
      window.sessionStorage.setItem('aiChat.sessionId', fresh)
      return fresh
    } catch {
      return uuidv4()
    }
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

  const {
    messages,
    sendMessage,
    regenerate,
    stop,
    status,
    error,
    setMessages,
    clearError
  } = useChat({
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

  const errorCode = useMemo(() => parseChatErrorCode(error), [error])
  const isConversationCapped = errorCode === CONVERSATION_CAPPED_CODE
  // Retriable by default so transient failures (network/5xx/mid-stream, which
  // carry no code) keep their Retry; hidden only for known deterministic codes.
  const canRetry =
    error != null && !NON_RETRIABLE_CHAT_ERROR_CODES.has(errorCode ?? '')

  // Cap-hit is a terminal state with no usable "close" control on mobile (the
  // pinned bar only collapses — it never unmounts AiChat), so reset the
  // conversation in place instead: clear the resent history (which clears the
  // server-side size cap), drop the error, and rotate the sessionId so the
  // next turn is a clean Langfuse session. Works identically on the desktop
  // overlay and the mobile pinned bar.
  const handleStartNewConversation = useCallback(() => {
    setMessages([])
    clearError()
    setInput('')
    setCollapsed(false)
    const fresh = uuidv4()
    try {
      window.sessionStorage.setItem('aiChat.sessionId', fresh)
    } catch {
      // sessionStorage can throw (Safari private mode, sandboxed iframes).
    }
    setSessionId(fresh)
  }, [setMessages, clearError])

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
      if (input.trim().length === 0 || isLoading || isConversationCapped) return
      setCollapsed(false)
      void sendMessage({ text: input })
      setInput('')
    },
    [input, isLoading, isConversationCapped, sendMessage]
  )

  const lastAssistantIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i
    }
    return -1
  }, [messages])

  const hasMessages = messages.length > 0
  // Collapse wins over message presence so the user can dismiss the
  // sheet from idle (empty chat) as well as from active.
  const sheetState: AiChatSheetState = collapsed
    ? 'collapsed'
    : hasMessages
      ? 'active'
      : 'idle'
  useEffect(() => {
    onSheetStateChange?.(sheetState)
  }, [sheetState, onSheetStateChange])

  const showDragHandle = isPanel && collapsible
  const showHeader = isPanel
  // Empty-state hero is overlay-only: gives the user a clear "this is
  // the chat" signal when the overlay auto-opens with no messages yet
  // (NES-1654). Hidden once a message exists, is being sent, or there's
  // an error so it doesn't compete with conversation content.
  const showOverlayHero =
    isOverlay && messages.length === 0 && !isLoading && error == null
  // We keep header/conversation/input mounted in every state and rely on
  // the parent sheet's height transition + overflow:hidden to clip them
  // as the sheet collapses. Hiding via display:none would short-circuit
  // the animation — the content would vanish instantly while only the
  // empty box height transitioned, which reads as "no animation at all".

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
              onCollapse={handleCollapse}
              onExpand={handleExpand}
            />
          )}
          {showHeader && <ChatHeader thinking={isLoading} />}
        </Box>
      )}

      <Box
        sx={{
          // `relative` anchors the overlay hero's absolute positioning
          // to the conversation area rather than the viewport.
          position: 'relative',
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          minHeight: 0,
          width: '100%',
          maxWidth: { xs: 'none', sm: '48rem' },
          mx: 'auto'
        }}
      >
        {showOverlayHero && (
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 4,
              pointerEvents: 'none',
              // One-shot wave animation on mount: each character lifts
              // 8px then settles, staggered left-to-right. Draws the eye
              // to the hero when the chat opens, then stays out of the
              // way. The base (0%/100%) is translateY(0) so each char's
              // resting state is its natural position — no fill-mode
              // needed.
              '@keyframes aiChatHeroWave': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-8px)' }
              }
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: 22, sm: 26, md: 28 },
                fontWeight: 500,
                color: OVERLAY_HERO_FG,
                textAlign: 'center',
                lineHeight: 1.3
              }}
            >
              {Array.from(t('Ask me anything')).map((char, i) => (
                <Box
                  key={i}
                  component="span"
                  sx={{
                    display: 'inline-block',
                    animation: `aiChatHeroWave 700ms ease-in-out ${i * 50}ms 1`,
                    '@media (prefers-reduced-motion: reduce)': {
                      animation: 'none'
                    }
                  }}
                >
                  {/* nbsp keeps inter-word spacing intact inside the
                      inline-block per-character spans. */}
                  {char === ' ' ? '\u00A0' : char}
                </Box>
              ))}
            </Typography>
          </Box>
        )}
        <Conversation
          scrollKey={messages.length}
          // 72px = floating capsule height (44px) + bottom offset (8px) +
          // safe-area headroom + 16px breathing room — keeps the last
          // message clear of the absolute-positioned PromptInput below.
          bottomClearance={72}
        >
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
                  {isConversationCapped
                    ? t(
                        "This conversation's gotten long. Start a new one to keep chatting — this clears the current session."
                      )
                    : t('Something went wrong. Please try again.')}
                </Box>
              </Message>
              {isConversationCapped ? (
                // Always shown in the capped state — it's the only way out
                // now that the input is disabled.
                <Box sx={{ display: 'flex', px: 2, py: 0.25 }}>
                  <Button
                    size="small"
                    onClick={handleStartNewConversation}
                    aria-label={t('Start a new conversation')}
                    sx={{
                      fontSize: 12,
                      color: isOverlay ? OVERLAY_FG_RETRY : MUTED_FG,
                      minWidth: 0
                    }}
                  >
                    {t('Start a new conversation')}
                  </Button>
                </Box>
              ) : (
                canRetry && (
                  <Box sx={{ display: 'flex', px: 2, py: 0.25 }}>
                    <Button
                      size="small"
                      onClick={handleRetry}
                      aria-label={t('Retry')}
                      sx={{
                        fontSize: 12,
                        color: isOverlay ? OVERLAY_FG_RETRY : MUTED_FG,
                        minWidth: 0
                      }}
                    >
                      {t('Retry')}
                    </Button>
                  </Box>
                )
              )}
            </Box>
          )}
        </Conversation>
      </Box>

      {isPanel && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 140,
            pointerEvents: 'none',
            zIndex: 1,
            background: SHEET_BOTTOM_FADE,
            opacity: sheetState === 'collapsed' ? 0 : 1,
            transition: 'opacity 200ms ease-out'
          }}
        />
      )}

      <Box
        sx={{
          position: 'absolute',
          left: 8,
          right: 8,
          bottom: 'calc(env(safe-area-inset-bottom) + 8px)',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mx: 'auto',
          maxWidth: { xs: 'none', sm: '48rem' },
          // Slide the floating input out the bottom when the sheet is
          // collapsed. Synced to the same 280ms cubic-bezier as the
          // PinnedChatBar height transition so they animate together.
          transform:
            sheetState === 'collapsed' ? 'translateY(140%)' : 'translateY(0)',
          opacity: sheetState === 'collapsed' ? 0 : 1,
          pointerEvents: sheetState === 'collapsed' ? 'none' : 'auto',
          transition:
            'transform 280ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease-out'
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <PromptInput
            input={input}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onStop={stop}
            disabled={isConversationCapped}
            variant={isOverlay ? 'floating' : 'inline'}
          />
        </Box>
      </Box>
    </Box>
  )
}
