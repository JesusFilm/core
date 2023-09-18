import Paper from '@mui/material/Paper'
import { ReactElement } from 'react'

export function PageWrapper({
  children
}: {
  children: ReactElement
}): ReactElement {
  return <Paper sx={{ minWidth: '600px' }}>{children}</Paper>
}
