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
  SCROLL_PILL_SHADOW,
  SCROLLBAR_THUMB,
  SCROLLBAR_THUMB_HOVER
} from '../AiChat/chatStyles'

interface ConversationProps {
  children: ReactNode
  /**
   * Increments when a new message is appended. The conversation
   * scrolls to the bottom on change (only when the user was already
   * near the bottom). Streaming text growth keeps the user pinned
   * to the bottom while they were already there, mimicking
   * `useStickToBottom`. If the reader has scrolled up, growth is
   * left alone and the "scroll to latest" pill becomes the way back.
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

  // Track size changes on both the scrollable container AND the
  // content. Content resizes happen when streaming text grows or
  // images load — if the reader was at the bottom we keep them
  // pinned there (mirrors `useStickToBottom`). Container resizes
  // happen when the parent sheet collapses/expands (clientHeight
  // changes — without this the pill would keep rendering against a
  // 0-height scrollable area).
  useEffect(() => {
    const scrollEl = scrollRef.current
    const contentEl = contentRef.current
    if (scrollEl == null || contentEl == null) return undefined
    const contentObserver = new ResizeObserver(() => {
      if (wasNearBottomRef.current) {
        scrollToBottom(false)
      }
      evaluateAtBottom()
    })
    const scrollObserver = new ResizeObserver(() => evaluateAtBottom())
    contentObserver.observe(contentEl)
    scrollObserver.observe(scrollEl)
    return () => {
      contentObserver.disconnect()
      scrollObserver.disconnect()
    }
  }, [evaluateAtBottom, scrollToBottom])

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
            pb: `${8 + bottomClearance}px`
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
            bgcolor: 'common.white',
            color: 'grey.900',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: SCROLL_PILL_SHADOW,
            '&:hover': { bgcolor: 'common.white' }
          }}
        >
          <KeyboardArrowDownRoundedIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  )
}
