import Box from '@mui/material/Box'
import { ReactElement } from 'react'

interface FieldWrapperProps {
  children: ReactElement
}

/*
Wraps around each field elements:
label, description, children, error
*/

export function FieldWrapper({ children }: FieldWrapperProps): ReactElement {
  return (
    <Box data-testid="FieldWrapper" sx={{ pb: 4 }}>
      {children}
    </Box>
  )
}
