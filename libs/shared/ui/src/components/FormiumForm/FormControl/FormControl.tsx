import { FormControlProps } from '@formium/react'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

export function FormControl({
  children,
  description,
  error,
  label
}: FormControlProps): ReactElement {
  return (
    <>
      {label != null && <Typography variant="subtitle1">{label}</Typography>}
      {description != null && (
        <Typography variant="body1">{description}</Typography>
      )}
      {children}
      {error != null && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}
    </>
  )
}
