import SendRoundedIcon from '@mui/icons-material/SendRounded'
import StopRoundedIcon from '@mui/icons-material/StopRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import { useTranslation } from 'next-i18next/pages'
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  ReactElement,
  useCallback
} from 'react'

import {
  ASSISTANT_FG,
  BRAND_RED,
  BRAND_RED_HOVER,
  DIVIDER,
  OVERLAY_FG_MUTED,
  OVERLAY_FILL_LOW,
  OVERLAY_INPUT_BG,
  OVERLAY_INPUT_BORDER,
  OVERLAY_INPUT_SHADOW,
  PANEL_INPUT_BG,
  PANEL_INPUT_BORDER,
  PANEL_INPUT_SHADOW,
  PRIMARY_ON,
  TEXT_SECONDARY
} from '../AiChat/chatStyles'

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

// Cap auto-grow at 6 rows so the floating capsule can't push the
// conversation off-screen — past this the textarea scrolls internally.
const MAX_INPUT_ROWS = 6

export function PromptInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  onStop,
  variant = 'inline'
}: PromptInputProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      // Enter submits; Shift+Enter inserts a newline so users can
      // compose multi-line questions.
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

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
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
        bgcolor: isFloating ? OVERLAY_INPUT_BG : PANEL_INPUT_BG,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: 9999,
        border: '1px solid',
        borderColor: isFloating ? OVERLAY_INPUT_BORDER : PANEL_INPUT_BORDER,
        boxShadow: isFloating ? OVERLAY_INPUT_SHADOW : PANEL_INPUT_SHADOW
      }}
    >
      <InputBase
        multiline
        maxRows={MAX_INPUT_ROWS}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={t('Ask anything…')}
        disabled={isLoading}
        inputProps={{ 'aria-label': t('Chat message input') }}
        sx={{
          flex: 1,
          minWidth: 0,
          px: '14px',
          py: '9px',
          color: isFloating ? PRIMARY_ON : ASSISTANT_FG,
          // font-size >= 16px keeps iOS Safari from auto-zooming on focus
          // (regression guard from the M1 fix).
          fontSize: 16,
          lineHeight: 1.375,
          fontFamily: 'inherit',
          '& .MuiInputBase-input': {
            p: 0,
            fontSize: 16,
            lineHeight: 1.375,
            fontFamily: 'inherit',
            color: 'inherit',
            '&::placeholder': {
              color: isFloating ? OVERLAY_FG_MUTED : TEXT_SECONDARY,
              opacity: 1
            }
          },
          '&.Mui-disabled, & .MuiInputBase-input.Mui-disabled': {
            color: TEXT_SECONDARY,
            WebkitTextFillColor: TEXT_SECONDARY
          }
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
            bgcolor: BRAND_RED,
            color: PRIMARY_ON,
            '&:hover': { bgcolor: BRAND_RED_HOVER }
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
              ? BRAND_RED
              : isFloating
                ? OVERLAY_FILL_LOW
                : DIVIDER,
            color: canSubmit
              ? PRIMARY_ON
              : isFloating
                ? OVERLAY_FG_MUTED
                : TEXT_SECONDARY,
            '&:hover': {
              bgcolor: canSubmit
                ? BRAND_RED_HOVER
                : isFloating
                  ? OVERLAY_FILL_LOW
                  : DIVIDER
            },
            '&.Mui-disabled': {
              bgcolor: isFloating ? OVERLAY_FILL_LOW : DIVIDER,
              color: isFloating ? OVERLAY_FG_MUTED : TEXT_SECONDARY
            }
          }}
        >
          <SendRoundedIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  )
}
