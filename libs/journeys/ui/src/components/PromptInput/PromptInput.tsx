import SendRoundedIcon from '@mui/icons-material/SendRounded'
import StopRoundedIcon from '@mui/icons-material/StopRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import {
  FormEvent,
  KeyboardEvent,
  ReactElement,
  useCallback,
  useRef
} from 'react'

interface PromptInputProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  isLoading: boolean
  onStop?: () => void
}

export function PromptInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  onStop
}: PromptInputProps): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (input.trim().length > 0 && !isLoading) {
          onSubmit(e as unknown as FormEvent)
        }
      }
    },
    [input, isLoading, onSubmit]
  )

  const handleFormSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      if (input.trim().length > 0 && !isLoading) {
        onSubmit(e)
      }
    },
    [input, isLoading, onSubmit]
  )

  const canSubmit = input.trim().length > 0

  return (
    <Box
      component="form"
      onSubmit={handleFormSubmit}
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 1,
        px: 1.5,
        pt: 1,
        pb: 1.5,
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      <TextField
        inputRef={textareaRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Ask me anything"
        disabled={isLoading}
        multiline
        maxRows={6}
        size="small"
        fullWidth
        inputProps={{
          'aria-label': 'Chat message input',
          onKeyDown: handleKeyDown
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            bgcolor: 'grey.50',
            fontSize: 16
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none'
          },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            border: 'none'
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
            {
              border: 'none'
            }
        }}
      />
      {isLoading ? (
        <IconButton
          type="button"
          onClick={onStop}
          aria-label="Stop generating"
          sx={{ bgcolor: 'grey.200', '&:hover': { bgcolor: 'grey.300' } }}
        >
          <StopRoundedIcon fontSize="small" />
        </IconButton>
      ) : (
        <IconButton
          type="submit"
          disabled={!canSubmit}
          aria-label="Send message"
          sx={{
            bgcolor: canSubmit ? 'primary.main' : 'grey.200',
            color: canSubmit ? 'primary.contrastText' : 'text.disabled',
            '&:hover': {
              bgcolor: canSubmit ? 'primary.dark' : 'grey.300'
            },
            '&.Mui-disabled': {
              bgcolor: 'grey.200',
              color: 'text.disabled'
            }
          }}
        >
          <SendRoundedIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  )
}
