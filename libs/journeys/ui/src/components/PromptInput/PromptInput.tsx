import SendRoundedIcon from '@mui/icons-material/SendRounded'
import StopRoundedIcon from '@mui/icons-material/StopRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'
import { keyframes } from '@mui/system'
import { useTranslation } from 'next-i18next/pages'
import {
  ChangeEvent,
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  ReactElement,
  useCallback,
  useRef
} from 'react'

import {
  ASSISTANT_FG,
  DIVIDER,
  OVERLAY_FG_MUTED,
  OVERLAY_FILL_LOW,
  OVERLAY_INPUT_BG,
  OVERLAY_INPUT_BORDER,
  OVERLAY_INPUT_SHADOW,
  PANEL_INPUT_BG,
  PANEL_INPUT_BORDER,
  PANEL_INPUT_SHADOW,
  PRIMARY,
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

// Mirror of MAX_MESSAGE_CHARS in apps/journeys/pages/api/chat/index.ts.
// Keep both in sync — the server rejects messages that exceed this length.
export const MAX_MESSAGE_CHARS = 4000

// Counter stays hidden until the user is within ~25% of the cap to keep
// the input chrome quiet during normal use.
const COUNTER_VISIBILITY_THRESHOLD = Math.floor(MAX_MESSAGE_CHARS * 0.75)
const COUNTER_WARNING_THRESHOLD = Math.floor(MAX_MESSAGE_CHARS * 0.9)

const SHAKE_CLASS = 'prompt-input-shake'
const SHAKE_DURATION_MS = 400
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
`

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
  const formRef = useRef<HTMLDivElement>(null)

  const triggerShake = useCallback(() => {
    const el = formRef.current
    if (el == null) return
    el.classList.remove(SHAKE_CLASS)
    // Force reflow so a back-to-back shake (e.g. user mashing keys at the
    // cap) restarts the animation rather than being deduplicated.
    void el.offsetWidth
    el.classList.add(SHAKE_CLASS)
  }, [])

  const handleAnimationEnd = useCallback(() => {
    formRef.current?.classList.remove(SHAKE_CLASS)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      // Enter submits; Shift+Enter inserts a newline so users can
      // compose multi-line questions.
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (input.trim().length > 0 && !isLoading) {
          onSubmit(e as unknown as FormEvent)
        }
        return
      }
      // Already at the cap and the user pressed a printable key — the
      // native maxLength drops the input silently, which feels broken.
      // Shake the capsule so the limit is visible.
      if (
        input.length >= MAX_MESSAGE_CHARS &&
        e.key.length === 1 &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        triggerShake()
      }
    },
    [input, isLoading, onSubmit, triggerShake]
  )

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const value = e.target.value
      // Belt-and-suspenders alongside the input's native maxLength: if any
      // path (autofill, IME) gets oversized text in, truncate and cue.
      if (value.length > MAX_MESSAGE_CHARS) {
        onInputChange(value.slice(0, MAX_MESSAGE_CHARS))
        triggerShake()
        return
      }
      onInputChange(value)
    },
    [onInputChange, triggerShake]
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent<Element>) => {
      const pasted = e.clipboardData.getData('text')
      if (pasted.length === 0) return
      const target = e.target as HTMLTextAreaElement | HTMLInputElement
      const start = target.selectionStart ?? input.length
      const end = target.selectionEnd ?? input.length
      const next = input.slice(0, start) + pasted + input.slice(end)
      // Within bounds — let the browser apply the paste normally so
      // selection / undo history stay intact.
      if (next.length <= MAX_MESSAGE_CHARS) return
      e.preventDefault()
      onInputChange(next.slice(0, MAX_MESSAGE_CHARS))
      triggerShake()
    },
    [input, onInputChange, triggerShake]
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

  const showCounter = input.length >= COUNTER_VISIBILITY_THRESHOLD
  const atCap = input.length >= MAX_MESSAGE_CHARS
  const counterMutedColor = isFloating ? OVERLAY_FG_MUTED : TEXT_SECONDARY
  const counterColor = atCap
    ? 'error.main'
    : input.length >= COUNTER_WARNING_THRESHOLD
      ? 'warning.main'
      : counterMutedColor

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box
        component="form"
        ref={formRef}
        onSubmit={handleFormSubmit}
        onAnimationEnd={handleAnimationEnd}
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
          boxShadow: isFloating ? OVERLAY_INPUT_SHADOW : PANEL_INPUT_SHADOW,
          [`&.${SHAKE_CLASS}`]: {
            animation: `${shake} ${SHAKE_DURATION_MS}ms ease-in-out`
          },
          '@media (prefers-reduced-motion: reduce)': {
            [`&.${SHAKE_CLASS}`]: {
              animation: 'none'
            }
          }
        }}
      >
        <InputBase
          multiline
          maxRows={MAX_INPUT_ROWS}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={t('Ask anything…')}
          disabled={isLoading}
          inputProps={{
            'aria-label': t('Chat message input'),
            maxLength: MAX_MESSAGE_CHARS
          }}
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
                  ? OVERLAY_FILL_LOW
                  : DIVIDER,
              color: canSubmit
                ? PRIMARY_ON
                : isFloating
                  ? OVERLAY_FG_MUTED
                  : TEXT_SECONDARY,
              '&:hover': {
                bgcolor: canSubmit
                  ? PRIMARY
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
      {showCounter && (
        <Typography
          aria-live="polite"
          data-testid="prompt-input-counter"
          sx={{
            position: 'absolute',
            right: 14,
            bottom: -14,
            fontSize: 10,
            lineHeight: 1,
            fontFamily: 'inherit',
            fontVariantNumeric: 'tabular-nums',
            color: counterColor,
            transition: 'color 0.2s ease',
            userSelect: 'none',
            pointerEvents: 'none'
          }}
        >
          {input.length}/{MAX_MESSAGE_CHARS}
        </Typography>
      )}
    </Box>
  )
}
