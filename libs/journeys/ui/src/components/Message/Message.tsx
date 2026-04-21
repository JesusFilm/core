import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

type MessageRole = 'user' | 'assistant'

interface MessageProps {
  role: MessageRole
  children: ReactNode
}

export function Message({ role, children }: MessageProps): ReactElement {
  const isUser = role === 'user'

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        px: 2,
        py: 0.5
      }}
    >
      <Box
        sx={{
          bgcolor: isUser ? '#6D28D9' : '#f5f5f5',
          color: isUser ? '#ffffff' : '#1a1a1a',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          px: 1.75,
          py: 1.25,
          maxWidth: '80%',
          wordBreak: 'break-word'
        }}
      >
        <Typography
          variant="body2"
          component="div"
          sx={{ lineHeight: 1.5, color: 'inherit' }}
        >
          {children}
        </Typography>
      </Box>
    </Box>
  )
}
