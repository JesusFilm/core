import SendRoundedIcon from '@mui/icons-material/SendRounded'
import StopRoundedIcon from '@mui/icons-material/StopRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next'
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
  /**
   * `inline` (default) renders the input as a flat bar with a top border,
   * suited to a panel context. `floating` renders it as a rounded capsule
   * with a shadow, for overlay contexts with no surrounding chrome.
   */
  variant?: 'inline' | 'floating'
}

export function PromptInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  onStop,
  variant = 'inline'
}: PromptInputProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
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
  const isFloating = variant === 'floating'

  return (
    <Box
      component="form"
      onSubmit={handleFormSubmit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: isFloating ? 1 : 1.5,
        bgcolor: 'common.white',
        borderTop: isFloating ? 'none' : '1px solid #e0e0e0',
        borderRadius: isFloating ? 9999 : 0,
        boxShadow: isFloating
          ? '0 10px 30px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.1)'
          : 'none'
      }}
    >
      <TextField
        inputRef={textareaRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={t('Ask me anything')}
        disabled={isLoading}
        multiline
        maxRows={6}
        size="small"
        fullWidth
        inputProps={{
          'aria-label': t('Chat message input'),
          onKeyDown: handleKeyDown
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: isFloating ? 9999 : 3,
            bgcolor: isFloating ? 'transparent' : 'grey.50'
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
            },
          '& .MuiInputBase-input': {
            fontSize: 16,
            color: '#1a1a1a'
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#9e9e9e',
            opacity: 1
          }
        }}
      />
      {isLoading ? (
        <IconButton
          type="button"
          onClick={onStop}
          aria-label={t('Stop generating')}
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            p: 0,
            bgcolor: '#e0e0e0',
            color: '#666',
            '&:hover': { bgcolor: '#d0d0d0' }
          }}
        >
          <StopRoundedIcon fontSize="small" />
        </IconButton>
      ) : (
        <IconButton
          type="submit"
          disabled={!canSubmit}
          aria-label={t('Send message')}
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            p: 0,
            bgcolor: canSubmit ? '#6D28D9' : '#e0e0e0',
            color: canSubmit ? '#ffffff' : '#999',
            '&:hover': {
              bgcolor: canSubmit ? '#5B21B6' : '#d0d0d0'
            },
            '&.Mui-disabled': {
              bgcolor: '#e0e0e0',
              color: '#999'
            }
          }}
        >
          <SendRoundedIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  )
}
