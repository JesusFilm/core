import { FormControlProps } from '@formium/react'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

/*
label: field question
description: field helper text
children: form elements
error: field error message
*/

export function FormControl({
  label,
  description,
  children,
  error
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
