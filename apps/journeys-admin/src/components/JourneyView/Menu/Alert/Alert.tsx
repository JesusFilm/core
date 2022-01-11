import { ReactElement } from 'react'

import MuiAlert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'

export interface AlertProps {
  open: boolean
  setOpen: (value: boolean) => void
  message: string
}

export function Alert({ open, setOpen, message }: AlertProps): ReactElement {
  const handleCloseAlert = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ): void => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      autoHideDuration={5000}
      onClose={handleCloseAlert}
    >
      <MuiAlert
        icon={false}
        severity="success"
        action={<CheckCircleRounded sx={{ color: '#5EA10A' }} />}
        sx={{
          width: '286px',
          color: 'white',
          backgroundColor: 'black',
          borderRadius: '2px'
        }}
      >
        {message}
      </MuiAlert>
    </Snackbar>
  )
}
