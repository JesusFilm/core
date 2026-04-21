import Avatar from '@mui/material/Avatar'
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
        gap: 1,
        px: 2,
        py: 0.5
      }}
    >
      {!isUser && (
        <Avatar
          sx={{
            width: 28,
            height: 28,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: 11,
            fontWeight: 600
          }}
        >
          AI
        </Avatar>
      )}
      <Box
        sx={{
          bgcolor: isUser ? 'primary.main' : 'grey.100',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          px: 1.75,
          py: 1.25,
          maxWidth: '80%',
          wordBreak: 'break-word'
        }}
      >
        <Typography variant="body2" component="div" sx={{ lineHeight: 1.5 }}>
          {children}
        </Typography>
      </Box>
    </Box>
  )
}
