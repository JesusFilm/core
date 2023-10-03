import Paper from '@mui/material/Paper'
import { ReactElement } from 'react'

interface PageWrapperProps {
  children: ReactElement
}

// wraps around the entire formium component

export function PageWrapper({ children }: PageWrapperProps): ReactElement {
  return <Paper sx={{ minWidth: '600px' }}>{children}</Paper>
}
