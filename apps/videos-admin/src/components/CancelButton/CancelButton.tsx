import Button from '@mui/material/Button'
import { ReactElement } from 'react'

export function CancelButton({ show, handleCancel }): ReactElement | null {
  if (!show) {
    return null
  }

  return (
    <Button variant="outlined" size="small" onClick={handleCancel}>
      Cancel
    </Button>
  )
}
