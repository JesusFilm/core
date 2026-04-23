import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

type MessageRole = 'user' | 'assistant'

interface MessageProps {
  role: MessageRole
  children: ReactNode
  /**
   * When true, assistant messages render as plain prose with no bubble
   * (ChatGPT-style). User messages retain their pill regardless. Used by
   * the desktop ChatOverlay; the default bubble layout is used everywhere
   * else.
   */
  plain?: boolean
}

export function Message({
  role,
  children,
  plain = false
}: MessageProps): ReactElement {
  const isUser = role === 'user'
  const isPlainAssistant = plain && !isUser

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
          bgcolor: isUser ? '#6D28D9' : isPlainAssistant ? 'transparent' : '#f5f5f5',
          color: isUser ? '#ffffff' : '#1a1a1a',
          borderRadius: isUser
            ? '16px 16px 4px 16px'
            : isPlainAssistant
              ? 0
              : '16px 16px 16px 4px',
          px: isPlainAssistant ? 0 : 1.75,
          py: isPlainAssistant ? 0 : 1.25,
          maxWidth: isPlainAssistant ? '100%' : '80%',
          wordBreak: 'break-word'
        }}
      >
        <Typography
          variant="body2"
          component="div"
          sx={{ lineHeight: 1.55, color: 'inherit' }}
        >
          {children}
        </Typography>
      </Box>
    </Box>
  )
}
