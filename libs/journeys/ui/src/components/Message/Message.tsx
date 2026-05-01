import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

import {
  ASSISTANT_BG,
  ASSISTANT_FG,
  PRIMARY,
  PRIMARY_ON
} from '../AiChat/tokens'

type MessageRole = 'user' | 'assistant'
type MessageSurface = 'light' | 'dark'

interface MessageProps {
  role: MessageRole
  children: ReactNode
  /**
   * When true, assistant messages render as plain prose with no bubble
   * (ChatGPT-style). User messages retain their pill regardless.
   */
  plain?: boolean
  /**
   * Background context the message sits on. Light = white pinned bar;
   * dark = blurred desktop overlay. Only affects plain assistant text
   * colour — bubble messages always have enough contrast on either.
   */
  surface?: MessageSurface
}

export function Message({
  role,
  children,
  plain = false,
  surface = 'light'
}: MessageProps): ReactElement {
  const isUser = role === 'user'
  const isPlainAssistant = plain && !isUser
  const plainAssistantColor =
    surface === 'dark' ? 'rgba(255, 255, 255, 0.92)' : ASSISTANT_FG

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        px: 3,
        py: 0.5
      }}
    >
      <Box
        sx={{
          bgcolor: isUser
            ? PRIMARY
            : isPlainAssistant
              ? 'transparent'
              : ASSISTANT_BG,
          color: isUser
            ? PRIMARY_ON
            : isPlainAssistant
              ? plainAssistantColor
              : ASSISTANT_FG,
          borderRadius: isUser
            ? '16px'
            : isPlainAssistant
              ? 0
              : '16px 16px 16px 4px',
          px: isPlainAssistant ? 0 : 2.5,
          py: isPlainAssistant ? 0 : 1.5,
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
