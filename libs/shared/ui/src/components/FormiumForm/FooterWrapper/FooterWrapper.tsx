import Box from '@mui/material/Box'
import { ReactElement } from 'react'

export function FooterWrapper({
  children
}: {
  children: ReactElement
}): ReactElement {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>{children}</Box>
  )
}
