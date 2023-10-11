import { FormControlProps } from '@formium/react'
import Box from '@mui/material/Box'
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
      <Box data-testid="FieldHeader" sx={{ pb: 4 }}>
        {label != null && (
          <Typography variant="h6" gutterBottom>
            {label}
          </Typography>
        )}
        {description != null && (
          <Typography variant="body2">{description}</Typography>
        )}
      </Box>
      {children}
      {error != null && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}
    </>
  )
}
