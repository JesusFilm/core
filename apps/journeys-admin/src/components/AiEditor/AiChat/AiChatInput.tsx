import SendRoundedIcon from '@mui/icons-material/SendRounded'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { KeyboardEvent, ReactElement } from 'react'

interface AiChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled: boolean
  selectedCardId?: string | null
  selectedCardIndex?: number | null
  onClearSelectedCard?: () => void
}

const MAX_LENGTH = 2000

export function AiChatInput({
  value,
  onChange,
  onSend,
  disabled,
  selectedCardId,
  selectedCardIndex,
  onClearSelectedCard
}: AiChatInputProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const charsLeft = MAX_LENGTH - value.length
  const nearLimit = charsLeft < 200

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>): void {
    if (
      (e.metaKey || e.ctrlKey) &&
      e.key === 'Enter' &&
      !disabled &&
      value.trim().length > 0
    ) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
      {selectedCardId != null && selectedCardIndex != null && (
        <Box sx={{ mb: 1 }}>
          <Chip
            size="small"
            label={t('Screen {{n}} selected — changes will target this screen', {
              n: selectedCardIndex
            })}
            onDelete={onClearSelectedCard}
            color="primary"
            variant="outlined"
          />
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder={t("Describe what you'd like to change...")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          inputProps={{ maxLength: MAX_LENGTH }}
          size="small"
        />
        <IconButton
          onClick={onSend}
          disabled={disabled || value.trim().length === 0}
          color="primary"
          data-testid="AiChatSendButton"
        >
          <SendRoundedIcon />
        </IconButton>
      </Box>
      {nearLimit && (
        <Typography
          variant="caption"
          color={charsLeft < 50 ? 'error' : 'text.secondary'}
          sx={{ mt: 0.5 }}
        >
          {t('{{n}} characters remaining', { n: charsLeft })}
        </Typography>
      )}
    </Box>
  )
}
