import Box from '@mui/material/Box'
import { ReactElement } from 'react'

/** Wraps around the footer component to render the buttons */

export function FooterWrapper({
  children
}: {
  children: ReactElement
}): ReactElement {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>{children}</Box>
  )
}
