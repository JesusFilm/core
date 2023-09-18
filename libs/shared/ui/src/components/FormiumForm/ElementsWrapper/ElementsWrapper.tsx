import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

/** Wraps around the all of the field elements */

export function ElementsWrapper({
  children
}: {
  children: ReactElement
}): ReactElement {
  return (
    <Stack spacing={10} sx={{ m: 4 }}>
      {children}
    </Stack>
  )
}
