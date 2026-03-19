import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import StopIcon from '@mui/icons-material/Stop'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Stack from '@mui/material/Stack'
import { ReactElement, RefObject, useCallback, useState } from 'react'

import { AiChatStatus } from '../../AiEditor'

interface ChatInputProps {
  inputRef: RefObject<HTMLInputElement | null>
  status: AiChatStatus
  selectedCardId: string | null
  onSendMessage: (content: string) => void
  onStopGeneration: () => void
  onDismissContext: () => void
}

export function ChatInput({
  inputRef,
  status,
  selectedCardId,
  onSendMessage,
  onStopGeneration,
  onDismissContext
}: ChatInputProps): ReactElement {
  const [value, setValue] = useState('')
  const isAiActive = status === 'thinking' || status === 'executing'
  const hasText = value.trim().length > 0

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (trimmed.length === 0 || isAiActive) return
    onSendMessage(trimmed)
    setValue('')
  }, [value, isAiActive, onSendMessage])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== 'Enter') return
      if (event.shiftKey) return
      event.preventDefault()
      handleSubmit()
    },
    [handleSubmit]
  )

  return (
    <Box data-testid="ChatInput">
      {selectedCardId != null && (
        <Chip
          data-testid="ChatInput-contextPill"
          label={`Card: ${selectedCardId}`}
          size="small"
          onDelete={onDismissContext}
          deleteIcon={
            <CloseIcon
              sx={{ fontSize: 14 }}
            />
          }
          sx={{
            mb: 1,
            bgcolor: '#EBF3FE',
            color: '#1565C0',
            fontSize: 12,
            height: 26,
            '& .MuiChip-deleteIcon': {
              color: '#1565C0',
              '&:hover': { color: '#0D47A1' }
            }
          }}
        />
      )}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '10px',
          bgcolor: '#FAFAFA',
          px: 1.5,
          py: 0.5
        }}
      >
        <InputBase
          inputRef={inputRef}
          data-testid="ChatInput-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you want to change..."
          multiline
          maxRows={4}
          disabled={isAiActive}
          sx={{
            flex: 1,
            fontSize: 14,
            '& .MuiInputBase-input': {
              py: 1
            }
          }}
          inputProps={{
            'aria-label': 'Chat input'
          }}
        />
        {isAiActive ? (
          <IconButton
            data-testid="ChatInput-stopButton"
            onClick={onStopGeneration}
            aria-label="Stop generation"
            tabIndex={0}
            sx={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              bgcolor: 'error.main',
              color: 'white',
              flexShrink: 0,
              '&:hover': { bgcolor: 'error.dark' }
            }}
          >
            <StopIcon sx={{ fontSize: 20 }} />
          </IconButton>
        ) : (
          <IconButton
            data-testid="ChatInput-sendButton"
            onClick={handleSubmit}
            disabled={!hasText}
            aria-label="Send message"
            tabIndex={0}
            sx={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              bgcolor: hasText ? 'primary.main' : '#CCCCCC',
              color: 'white',
              flexShrink: 0,
              '&:hover': {
                bgcolor: hasText ? 'primary.dark' : '#CCCCCC'
              },
              '&.Mui-disabled': {
                bgcolor: '#CCCCCC',
                color: 'white'
              }
            }}
          >
            <SendIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </Stack>
    </Box>
  )
}
