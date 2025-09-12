import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { SxProps } from '@mui/system/styleFunctionSx'
import { ReactElement, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export interface CopyTextFieldProps {
  label?: string
  value?: string
  helperText?: string
  messageText?: string
  sx?: SxProps
  onCopyClick?: () => Promise<void>
  buttonVariant: 'icon' | 'button'
}

export function CopyTextField({
  label,
  value,
  helperText,
  sx = {},
  onCopyClick,
  buttonVariant = 'icon'
}: CopyTextFieldProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFocus = (): void => inputRef.current?.select()

  return (
    <TextField
      fullWidth
      sx={{ ...sx }}
      hiddenLabel={label == null}
      label={label}
      InputLabelProps={{ shrink: true }}
      inputRef={inputRef}
      disabled={value == null}
      inputProps={{ onFocus: handleFocus, value }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {buttonVariant === 'icon' ? (
              <IconButton onClick={onCopyClick} aria-label="Copy">
                <ContentCopyRoundedIcon />
              </IconButton>
            ) : (
              <Button
                onClick={onCopyClick}
                aria-label="Copy"
                disabled={value == null}
                sx={{
                  backgroundColor: 'black',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'secondary.dark'
                  },
                  '&:disabled': {
                    backgroundColor: 'secondary.dark',
                    color: 'divider'
                  },
                  width: '90px',
                  height: '48px',
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                <ContentCopyRoundedIcon sx={{ mr: 1 }} />
                {t('Copy')}
              </Button>
            )}
          </InputAdornment>
        ),
        readOnly: true
      }}
      variant="filled"
      helperText={helperText}
    />
  )
}
