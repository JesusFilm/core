import Box from '@mui/material/Box'
import { ReactElement, ReactNode } from 'react'
import { useStickToBottom } from 'use-stick-to-bottom'

interface ConversationProps {
  children: ReactNode
}

export function Conversation({ children }: ConversationProps): ReactElement {
  const { scrollRef, contentRef } = useStickToBottom()

  return (
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
  )
}
