import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode, useCallback } from 'react'
import { useStickToBottom } from 'use-stick-to-bottom'

import { ASSISTANT_FG, DIVIDER, SURFACE } from '../AiChat/tokens'

interface ConversationProps {
  children: ReactNode
}

export function Conversation({ children }: ConversationProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const { scrollRef, contentRef, isAtBottom, scrollToBottom } =
    useStickToBottom()

  const handleScrollToBottom = useCallback(() => {
    void scrollToBottom()
  }, [scrollToBottom])

  return (
    <Box sx={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex' }}>
      <Box
        ref={scrollRef}
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
          ref={contentRef}
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
          onClick={handleScrollToBottom}
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
