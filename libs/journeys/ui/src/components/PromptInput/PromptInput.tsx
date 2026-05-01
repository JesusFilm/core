import SendRoundedIcon from '@mui/icons-material/SendRounded'
import StopRoundedIcon from '@mui/icons-material/StopRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'next-i18next/pages'
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  ReactElement,
  useCallback,
  useRef
} from 'react'

import {
  ASSISTANT_FG,
  DIVIDER,
  INPUT_FILL,
  PRIMARY,
  PRIMARY_ON,
  SURFACE,
  TEXT_SECONDARY
} from '../AiChat/tokens'

interface PromptInputProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  isLoading: boolean
  onStop?: () => void
  /**
   * `inline` (default) — flat capsule for the pinned bar.
   * `floating` — rounded pill on a dark blurred backdrop for the desktop overlay.
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
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
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

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onInputChange(e.target.value)
    },
    [onInputChange]
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
        p: isFloating ? 0.75 : 1.5,
        bgcolor: isFloating ? 'rgba(38,38,46,0.78)' : SURFACE,
        backdropFilter: isFloating ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: isFloating ? 'blur(20px) saturate(180%)' : 'none',
        borderRadius: isFloating ? 9999 : 0,
        border: isFloating ? '1px solid rgba(255,255,255,0.12)' : 'none',
        borderTop: isFloating
          ? '1px solid rgba(255,255,255,0.12)'
          : `1px solid ${DIVIDER}`,
        boxShadow: 'none'
      }}
    >
      <Box
        component="input"
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={t('Ask anything…')}
        disabled={isLoading}
        aria-label={t('Chat message input')}
        sx={{
          flex: 1,
          minWidth: 0,
          height: '44px',
          border: 'none',
          outline: 'none',
          background: isFloating ? 'transparent' : INPUT_FILL,
          borderRadius: isFloating ? 9999 : '22px',
          px: '16px',
          // font-size >= 16px keeps iOS Safari from auto-zooming on focus
          // (regression guard from the M1 fix).
          fontSize: 16,
          lineHeight: 'normal',
          fontFamily: 'inherit',
          color: isFloating ? PRIMARY_ON : ASSISTANT_FG,
          boxSizing: 'border-box',
          '&::placeholder': {
            color: TEXT_SECONDARY,
            opacity: 1
          },
          '&:focus': { outline: 'none' },
          '&:disabled': { color: TEXT_SECONDARY }
        }}
      />
      {isLoading ? (
        <IconButton
          type="button"
          onClick={onStop}
          aria-label={t('Stop generating')}
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            p: 0,
            bgcolor: PRIMARY,
            color: PRIMARY_ON,
            '&:hover': { bgcolor: PRIMARY }
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
            width: 40,
            height: 40,
            flexShrink: 0,
            p: 0,
            bgcolor: canSubmit
              ? PRIMARY
              : isFloating
                ? 'rgba(255,255,255,0.18)'
                : DIVIDER,
            color: canSubmit
              ? PRIMARY_ON
              : isFloating
                ? 'rgba(255,255,255,0.6)'
                : TEXT_SECONDARY,
            '&:hover': {
              bgcolor: canSubmit
                ? PRIMARY
                : isFloating
                  ? 'rgba(255,255,255,0.18)'
                  : DIVIDER
            },
            '&.Mui-disabled': {
              bgcolor: isFloating ? 'rgba(255,255,255,0.18)' : DIVIDER,
              color: isFloating ? 'rgba(255,255,255,0.6)' : TEXT_SECONDARY
            }
          }}
        >
          <SendRoundedIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  )
}
