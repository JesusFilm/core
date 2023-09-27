import Container from '@mui/material/Container'
import { ReactElement } from 'react'

interface PageWrapperProps {
  children: ReactElement
}

// wraps around the entire formium component

export function PageWrapper({ children }: PageWrapperProps): ReactElement {
  return (
    <Container maxWidth="md" disableGutters>
      {children}
    </Container>
  )
}
