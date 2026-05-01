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

import { ASSISTANT_FG, DIVIDER, SURFACE } from '../AiChat/tokens'

interface ConversationProps {
  children: ReactNode
  /**
   * Increments when a new message is appended. The conversation
   * scrolls to the bottom on change (only when the user was already
   * near the bottom). Streaming text growth deliberately does not
   * trigger a scroll — readers control their own pace, and the
   * "scroll to latest" pill is the way back when they fall behind.
   */
  scrollKey?: number
}

const NEAR_BOTTOM_THRESHOLD_PX = 24

export function Conversation({
  children,
  scrollKey
}: ConversationProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const scrollRef = useRef<HTMLDivElement>(null)
  const wasNearBottomRef = useRef(true)
  const isFirstRenderRef = useRef(true)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const nearBottom = distanceFromBottom <= NEAR_BOTTOM_THRESHOLD_PX
    wasNearBottomRef.current = nearBottom
    setIsAtBottom(nearBottom)
  }, [])

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
          scrollbarColor: 'rgba(128, 128, 128, 0.5) transparent',
          '&::-webkit-scrollbar': {
            width: 8
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(128, 128, 128, 0.5)',
            borderRadius: 9999,
            border: '2px solid transparent',
            backgroundClip: 'padding-box'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(128, 128, 128, 0.7)'
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            py: 1
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
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 32,
            height: 32,
            bgcolor: SURFACE,
            color: ASSISTANT_FG,
            border: `1px solid ${DIVIDER}`,
            boxShadow: '0 4px 12px rgba(38,38,46,0.12)',
            '&:hover': { bgcolor: SURFACE }
          }}
        >
          <KeyboardArrowDownRoundedIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  )
}
