import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { SxProps } from '@mui/system/styleFunctionSx'
import { useSnackbar } from 'notistack'
import { ReactElement, useRef } from 'react'

export interface CopyTextFieldProps {
  label?: string
  value?: string
  helperText?: string
  messageText?: string
  sx?: SxProps
}

export function CopyTextField({
  label,
  value,
  helperText,
  messageText,
  sx = {}
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
