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

import { extractLanguageNames } from '@core/shared/ui/extractLanguageNames'

import { getCardChild, useBlocks } from '../../libs/block'
import { useJourney } from '../../libs/JourneyProvider'
import { Conversation } from '../Conversation'
import { CopyMessageButton } from '../CopyMessageButton'
import { Message } from '../Message'
import { PromptInput } from '../PromptInput'
import { Response } from '../Response'

import { ChatHeader } from './ChatHeader'
import {
  HEADER_WASH,
  MUTED_FG,
  OVERLAY_FG_RETRY,
  SHEET_BOTTOM_FADE
} from './chatStyles'

interface AiChatProps {
  /** When provided, this message is sent automatically on first render */
  initialMessage?: string
  /**
   * Notifies the parent when the sheet's logical state changes:
   *  - 'idle' — no messages yet; show header + input.
   *  - 'active' — messages present; full conversation.
   *
   * The pinned sheet uses this to choose the right height + animation.
   */
  onSheetStateChange?: (state: 'idle' | 'active') => void
  /**
   * When provided, renders a close (X) button in the ChatHeader. The pinned
   * mobile drawer and the desktop ChatOverlay both use this to dismiss the
   * sheet.
   */
  onClose?: () => void
  /**
   * Re-themes the chat for a dark backdrop (NES-1738 Option B: the desktop
   * ChatOverlay renders the compact bar over a dark layer). It drops the
   * header's red wash, lightens the header + assistant text to the overlay
   * tokens, and is otherwise a no-op. The mobile `PinnedChatBar` leaves it
   * false so its white sheet stays light.
   */
  onDark?: boolean
}

export type AiChatSheetState = 'idle' | 'active'

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
  'not_found',
  // A card with chat disabled (NES-1679) is deterministic — re-firing 403s again.
  'chat_disabled'
])

const CONVERSATION_CAPPED_CODE = 'conversation_capped'
// The card's chat was turned off server-side (NES-1679). We swap the generic
// "try again" copy for an honest "turned off" message and hide Retry (it would
// 403 again). The input deliberately stays usable: per the kill-switch design a
// stale tab still shows the input and each send fails closed with a visible
// message, and locking it would strand the user if they navigate to a card
// where chat is still enabled (the error persists in the mounted chat).
const CHAT_DISABLED_CODE = 'chat_disabled'

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
  // text colour shifts between light and dark surfaces. CopyMessageButton still
  // tints itself to the surface via `plain`.
  const isDark = surface === 'dark'
  return (
    <>
      <Message role="assistant" plain surface={surface}>
        <Response content={display} />
      </Message>
      {isComplete && text.length > 0 && (
        <CopyMessageButton content={text} plain={isDark} />
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
  onSheetStateChange,
  onClose,
  onDark = false
}: AiChatProps): ReactElement {
  // The dark-themed sheet (Option B) sits on a dark backdrop, so assistant
  // prose and surface tints use the dark tokens.
  const messageSurface: 'light' | 'dark' = onDark ? 'dark' : 'light'
  const { t } = useTranslation('libs-journeys-ui')
  const { journey } = useJourney()
  const [input, setInput] = useState('')
  const initialMessageSent = useRef(false)

  // The BCP-47 code (e.g. "ur") drives the about-this-chat disclosure link,
  // which loads locale copy from libs/locales/<bcp47>/ (NES-1724).
  const languageBcp47 = journey?.language?.bcp47 ?? undefined

  // Send the journey's language to the assistant as a human-readable name
  // (e.g. "Urdu"), not the BCP-47 code: the model resolves a language name far
  // more reliably than a code. The system prompt defaults to this language but
  // still answers in whatever language the user actually types (NES-1736).
  // The journey language is queried without a languageId filter, so this is
  // the first non-primary translation in API order, then the native (primary)
  // name, then the BCP-47 code — any human-readable name resolves better than
  // a code.
  const { localName, nativeName } = extractLanguageNames(
    journey?.language?.name ?? []
  )
  const language = localName ?? nativeName ?? languageBcp47 ?? undefined
  const languageRef = useRef(language)
  languageRef.current = language

  // Also send the raw code so the server can warn (and record in Datadog) when
  // the value reaching the prompt is only the code — i.e. the name didn't
  // resolve — so we can spot which codes lack a usable name (NES-1736).
  const languageBcp47Ref = useRef(languageBcp47)
  languageBcp47Ref.current = languageBcp47

  const journeyId = journey?.id
  const journeyIdRef = useRef(journeyId)
  journeyIdRef.current = journeyId

  // The active card id (NES-1679) lets the server enforce the per-card chat
  // kill switch. Read from the same global block history the rest of the viewer
  // uses (Conductor, StepFooter), so it tracks card navigation without
  // threading a prop through PinnedChatBar / ChatOverlay.
  const { blockHistory } = useBlocks()
  const cardId = getCardChild(blockHistory[blockHistory.length - 1])?.id
  const cardIdRef = useRef(cardId)
  cardIdRef.current = cardId

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
          languageBcp47: languageBcp47Ref.current,
          sessionId: sessionIdRef.current,
          journeyId: journeyIdRef.current,
          cardId: cardIdRef.current
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
    void regenerate()
  }, [regenerate])

  const errorCode = useMemo(() => parseChatErrorCode(error), [error])
  const isConversationCapped = errorCode === CONVERSATION_CAPPED_CODE
  const isChatDisabled = errorCode === CHAT_DISABLED_CODE
  // Retriable by default so transient failures (network/5xx/mid-stream, which
  // carry no code) keep their Retry; hidden only for known deterministic codes.
  const canRetry =
    error != null && !NON_RETRIABLE_CHAT_ERROR_CODES.has(errorCode ?? '')

  // Cap-hit is a terminal state — closing the mobile drawer keeps AiChat
  // mounted (the capped conversation would still be there on reopen), so
  // reset the conversation in place instead: clear the resent history (which
  // clears the server-side size cap), drop the error, and rotate the
  // sessionId so the next turn is a clean Langfuse session. Works
  // identically on the desktop overlay and the mobile drawer.
  const handleStartNewConversation = useCallback(() => {
    setMessages([])
    clearError()
    setInput('')
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
      void sendMessage({ text: initialMessage })
    }
  }, [initialMessage, sendMessage])

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      if (input.trim().length === 0 || isLoading || isConversationCapped) return
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

  // Both error actions (cap-hit reset, Retry) share the same dim colour,
  // lightened on the dark overlay backdrop.
  const errorActionColor = onDark ? OVERLAY_FG_RETRY : MUTED_FG

  const hasMessages = messages.length > 0
  const sheetState: AiChatSheetState = hasMessages ? 'active' : 'idle'
  useEffect(() => {
    onSheetStateChange?.(sheetState)
  }, [sheetState, onSheetStateChange])

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
      {/* pt compensates for the removed drag handle so the header doesn't
          sit flush against the sheet's rounded top edge. The dark overlay
          (Option B) has a visible top border, so it gets a larger inset
          (matching the 16px corner radius) for clear separation between the
          border and the header; the white mobile sheet keeps the smaller
          inset. On dark the red HEADER_WASH would read as a red bar, so the
          wrapper goes transparent and the dark layer shows through. */}
      <Box
        sx={{
          background: onDark ? 'transparent' : HEADER_WASH,
          flexShrink: 0,
          pt: onDark ? 2 : 1
        }}
      >
        <ChatHeader thinking={isLoading} onClose={onClose} onDark={onDark} />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          minHeight: 0,
          width: '100%',
          maxWidth: { xs: 'none', sm: '48rem' },
          mx: 'auto'
        }}
      >
        <Conversation
          scrollKey={messages.length}
          // 72px = input capsule height (44px) + bottom offset (8px) +
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
                    surface={messageSurface}
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
              <Message role="assistant" plain surface={messageSurface}>
                <TypingIndicator />
              </Message>
            )}
          {error != null && !isLoading && (
            <Box>
              <Message role="assistant" plain surface={messageSurface}>
                <Box component="span" sx={{ opacity: 0.7 }}>
                  {isConversationCapped
                    ? t(
                        "This conversation's gotten long. Start a new one to keep chatting — this clears the current session."
                      )
                    : isChatDisabled
                      ? t(
                          'Chat has been turned off for this part of the journey.'
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
                      color: errorActionColor,
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
                        color: errorActionColor,
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
          background: SHEET_BOTTOM_FADE
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          left: 8,
          right: 8,
          bottom: 'calc(env(safe-area-inset-bottom) + 8px)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 0.75,
          mx: 'auto',
          maxWidth: { xs: 'none', sm: '48rem' }
        }}
      >
        <PromptInput
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onStop={stop}
          disabled={isConversationCapped}
        />
      </Box>
    </Box>
  )
}
