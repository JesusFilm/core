import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import UndoIcon from '@mui/icons-material/Undo'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import { AiChatMessage } from '../../AiEditor'

interface MessageBubbleProps {
  message: AiChatMessage
  onUndo?: () => void
}

export function MessageBubble({
  message,
  onUndo
}: MessageBubbleProps): ReactElement {
  const [hovered, setHovered] = useState(false)
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <Box
        data-testid="MessageBubble-user"
        sx={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Box sx={{ maxWidth: '80%', position: 'relative' }}>
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: 2,
              py: 1.5,
              borderRadius: '12px 12px 4px 12px',
              wordBreak: 'break-word'
            }}
          >
            <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
              {message.content}
            </Typography>
          </Box>
          {onUndo != null && hovered && (
            <IconButton
              data-testid="MessageBubble-undo"
              onClick={onUndo}
              aria-label="Undo message"
              tabIndex={0}
              size="small"
              sx={{
                position: 'absolute',
                bottom: -12,
                right: 4,
                bgcolor: '#F5F5F5',
                border: '1px solid',
                borderColor: 'divider',
                width: 24,
                height: 24,
                '&:hover': { bgcolor: '#EBEBEB' }
              }}
            >
              <UndoIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            </IconButton>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Stack
      data-testid="MessageBubble-assistant"
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
    >
      <Avatar
        sx={{
          width: 28,
          height: 28,
          bgcolor: '#F5F5F5',
          flexShrink: 0
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
      </Avatar>
      <Typography
        variant="body2"
        sx={{
          color: 'secondary.dark',
          lineHeight: 1.6,
          pt: 0.5,
          wordBreak: 'break-word'
        }}
      >
        {message.content}
      </Typography>
    </Stack>
  )
}
