import { ReactElement, useRef } from 'react'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import { useSnackbar } from 'notistack'

export interface CopyTextFieldProps {
  label?: string
  value?: string
  helperText?: string
  messageText?: string
}

export function CopyTextField({
  label,
  value,
  helperText,
  messageText
}: CopyTextFieldProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCopyClick = async (): Promise<void> => {
    await navigator.clipboard.writeText(value ?? '')
    enqueueSnackbar(messageText ?? 'Link copied', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  const handleFocus = (): void => inputRef.current?.select()

  return (
    <TextField
      fullWidth
      sx={{
        '.MuiInputLabel-root': {
          marginLeft: '32px'
        },
        '.MuiInputAdornment-root.MuiInputAdornment-positionStart': {
          marginTop: '0 !important'
        }
      }}
      hiddenLabel={label == null}
      label={label}
      defaultValue={value}
      inputRef={inputRef}
      disabled={value == null}
      inputProps={{ onFocus: handleFocus }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <LinkRoundedIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={handleCopyClick}
              aria-label="Copy"
              disabled={value == null}
            >
              <ContentCopyRoundedIcon />
            </IconButton>
          </InputAdornment>
        ),
        readOnly: true
      }}
      variant="filled"
      helperText={helperText}
    />
  )
}
