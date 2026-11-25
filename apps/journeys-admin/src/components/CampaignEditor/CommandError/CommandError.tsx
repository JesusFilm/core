import Alert from '@mui/material/Alert'
import { ReactElement } from 'react'

interface CommandErrorProps {
  /** The refusal's message, shown verbatim; nothing renders without one. */
  error?: string | null
}

/** The error a control's last write was refused with, under the control. */
export function CommandError({
  error
}: CommandErrorProps): ReactElement | null {
  if (error == null) return null
  return (
    <Alert severity="error" role="alert">
      {error}
    </Alert>
  )
}
