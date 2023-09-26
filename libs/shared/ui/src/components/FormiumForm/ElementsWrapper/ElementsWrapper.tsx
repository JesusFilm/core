import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

interface ElementsWrapperProps {
  children: ReactElement
}

// Wraps around the all of the field elements

export function ElementsWrapper({
  children
}: ElementsWrapperProps): ReactElement {
  return (
    <Stack spacing={10} sx={{ m: 4 }}>
      {children}
    </Stack>
  )
}
