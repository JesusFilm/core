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
        flexDirection: 'column'
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
