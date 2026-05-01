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
  PRIMARY,
  PRIMARY_ON,
  TEXT_SECONDARY
} from '../AiChat/tokens'

interface PromptInputProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  isLoading: boolean
  onStop?: () => void
  /**
   * `inline` (default) — floating rounded capsule for the pinned bar
   * (semi-transparent white surface, drop shadow, backdrop blur).
   * `floating` — same form-factor on a dark blurred backdrop for the
   * desktop ambient overlay.
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

  // Both variants render a floating pill. `inline` sits over a light
  // surface (pinned bar) and `floating` sits over a dark journey/overlay
  // backdrop. The form itself IS the visible capsule — no separate
  // inputFill layer underneath.
  return (
    <Box
      component="form"
      onSubmit={handleFormSubmit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        pl: 0.75,
        pr: 1.5,
        py: 0.75,
        bgcolor: isFloating
          ? 'rgba(38, 38, 46, 0.78)'
          : 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: 9999,
        border: isFloating
          ? '1px solid rgba(255, 255, 255, 0.12)'
          : '1px solid rgba(38, 38, 46, 0.12)',
        boxShadow: isFloating
          ? '0 10px 30px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.1)'
          : '0 6px 18px rgba(38, 38, 46, 0.16), 0 1px 3px rgba(38, 38, 46, 0.10)'
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
          height: '40px',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          px: '14px',
          // font-size >= 16px keeps iOS Safari from auto-zooming on focus
          // (regression guard from the M1 fix).
          fontSize: 16,
          lineHeight: 'normal',
          fontFamily: 'inherit',
          color: isFloating ? PRIMARY_ON : ASSISTANT_FG,
          boxSizing: 'border-box',
          '&::placeholder': {
            color: isFloating ? 'rgba(255, 255, 255, 0.6)' : TEXT_SECONDARY,
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
            width: 32,
            height: 32,
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
            width: 32,
            height: 32,
            flexShrink: 0,
            p: 0,
            bgcolor: canSubmit
              ? PRIMARY
              : isFloating
                ? 'rgba(255, 255, 255, 0.18)'
                : DIVIDER,
            color: canSubmit
              ? PRIMARY_ON
              : isFloating
                ? 'rgba(255, 255, 255, 0.6)'
                : TEXT_SECONDARY,
            '&:hover': {
              bgcolor: canSubmit
                ? PRIMARY
                : isFloating
                  ? 'rgba(255, 255, 255, 0.18)'
                  : DIVIDER
            },
            '&.Mui-disabled': {
              bgcolor: isFloating ? 'rgba(255, 255, 255, 0.18)' : DIVIDER,
              color: isFloating ? 'rgba(255, 255, 255, 0.6)' : TEXT_SECONDARY
            }
          }}
        >
          <SendRoundedIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  )
}
