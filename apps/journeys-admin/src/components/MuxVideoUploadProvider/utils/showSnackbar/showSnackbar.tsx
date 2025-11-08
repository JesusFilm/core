import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'

export function createShowSnackbar(
  enqueueSnackbar: (message: string, options?: unknown) => string | number,
  closeSnackbar: (key: string | number) => void
) {
  return (
    message: string,
    variant: 'success' | 'error' | 'info' | 'warning',
    persist?: boolean
  ): void => {
    enqueueSnackbar(message, {
      variant,
      ...(persist === true && { persist: true }),
      action: (key): ReactElement => (
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={() => {
            closeSnackbar(key)
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )
    })
  }
}
