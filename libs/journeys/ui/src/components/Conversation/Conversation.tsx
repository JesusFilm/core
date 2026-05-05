import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'next-i18next/pages'
import {
  ReactElement,
  ReactNode,
  UIEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import {
  ASSISTANT_FG,
  DIVIDER,
  SCROLLBAR_THUMB,
  SCROLLBAR_THUMB_HOVER,
  SCROLL_PILL_SHADOW,
  SURFACE
} from '../AiChat/chatStyles'

interface ConversationProps {
  children: ReactNode
  /**
   * Increments when a new message is appended. The conversation
   * scrolls to the bottom on change (only when the user was already
   * near the bottom). Streaming text growth deliberately does NOT
   * trigger a scroll — readers control their own pace, and the
   * "scroll to latest" pill is the way back when they fall behind.
   */
  scrollKey?: number
  /**
   * Bottom padding (px) on the scrollable content. Use to leave
   * clearance for a floating absolute-positioned input below so the
   * last message isn't permanently obscured.
   */
  bottomClearance?: number
}

const NEAR_BOTTOM_THRESHOLD_PX = 24
const BOTTOM_FADE_HEIGHT_PX = 56

export function Conversation({
  children,
  scrollKey,
  bottomClearance = 0
}: ConversationProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const wasNearBottomRef = useRef(true)
  const isFirstRenderRef = useRef(true)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const fadeBeforeInput = bottomClearance > 0
  const bottomMask = fadeBeforeInput
    ? `linear-gradient(to bottom, black 0, black calc(100% - ${
        bottomClearance + BOTTOM_FADE_HEIGHT_PX
      }px), transparent calc(100% - ${bottomClearance}px), transparent 100%)`
    : undefined

  const evaluateAtBottom = useCallback(() => {
    const el = scrollRef.current
    if (el == null) return
    // No visible scroll area (e.g. parent sheet collapsed to a thin
    // handle) means there's nothing to scroll. Treat as at-bottom so
    // the pill doesn't render — otherwise scrollHeight - 0 - 0 reads
    // as "far above bottom" and the chevron leaks through.
    if (el.clientHeight === 0) {
      wasNearBottomRef.current = true
      setIsAtBottom(true)
      return
    }
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const nearBottom = distanceFromBottom <= NEAR_BOTTOM_THRESHOLD_PX
    wasNearBottomRef.current = nearBottom
    setIsAtBottom(nearBottom)
  }, [])

  const handleScroll = useCallback(
    (_e: UIEvent<HTMLDivElement>) => {
      evaluateAtBottom()
    },
    [evaluateAtBottom]
  )

  const scrollToBottom = useCallback((smooth: boolean) => {
    const el = scrollRef.current
    if (el == null) return
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }, [])

  const handleScrollToBottomClick = useCallback(() => {
    scrollToBottom(true)
  }, [scrollToBottom])

  // On mount: jump to bottom (no animation) so the latest message is
  // visible immediately. On subsequent message appends: animate to the
  // bottom, but only if the reader was near the bottom — if they had
  // scrolled up to read older content we leave them alone, and the
  // pill makes the new traffic discoverable.
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      scrollToBottom(false)
      return
    }
    if (wasNearBottomRef.current) {
      scrollToBottom(true)
    }
  }, [scrollKey, scrollToBottom])

  // Re-evaluate at-bottom (and toggle the pill) whenever either side of
  // the "is there anything to scroll to" comparison changes:
  //  - container resize (parent sheet collapse/expand) changes
  //    `clientHeight` without firing a scroll event — without this the
  //    pill would linger after a collapse.
  //  - content resize (streaming text, image load, message append)
  //    changes `scrollHeight` without firing a scroll event — without
  //    this the pill would never auto-appear once new content grows
  //    past the viewport.
  // We deliberately do NOT auto-scroll on content growth — readers
  // consume responses at their own pace, and the pill is the way back.
  useEffect(() => {
    const scrollEl = scrollRef.current
    const contentEl = contentRef.current
    if (scrollEl == null || contentEl == null) return undefined
    const scrollObserver = new ResizeObserver(() => evaluateAtBottom())
    const contentObserver = new ResizeObserver(() => evaluateAtBottom())
    scrollObserver.observe(scrollEl)
    contentObserver.observe(contentEl)
    return () => {
      scrollObserver.disconnect()
      contentObserver.disconnect()
    }
  }, [evaluateAtBottom])

  return (
    <Box sx={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex' }}>
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          ...(bottomMask != null
            ? {
                maskImage: bottomMask,
                WebkitMaskImage: bottomMask
              }
            : {}),
          scrollbarWidth: 'thin',
          scrollbarColor: `${SCROLLBAR_THUMB} transparent`,
          '&::-webkit-scrollbar': {
            width: 8
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: SCROLLBAR_THUMB,
            borderRadius: 9999,
            border: '2px solid transparent',
            backgroundClip: 'padding-box'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: SCROLLBAR_THUMB_HOVER
          }
        }}
      >
        <Box
          ref={contentRef}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            pt: 1,
            pb: `${
              8 + bottomClearance + (fadeBeforeInput ? BOTTOM_FADE_HEIGHT_PX : 0)
            }px`
          }}
        >
          {children}
        </Box>
      </Box>
      {!isAtBottom && (
        <IconButton
          onClick={handleScrollToBottomClick}
          aria-label={t('Scroll to latest message')}
          tabIndex={0}
          data-testid="ScrollToBottomPill"
          sx={{
            position: 'absolute',
            // Sit above any floating input clearance so the pill never
            // hides behind the absolute-positioned capsule.
            bottom: `${bottomClearance + 8}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 32,
            height: 32,
            bgcolor: SURFACE,
            color: ASSISTANT_FG,
            border: '1px solid',
            borderColor: DIVIDER,
            boxShadow: SCROLL_PILL_SHADOW,
            '&:hover': { bgcolor: SURFACE }
          }}
        >
          <KeyboardArrowDownRoundedIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  )
}
