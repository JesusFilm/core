import Container from '@mui/material/Container'
import { ReactNode } from 'react'

interface MobileProps {
  children: ReactNode
}

export function Root({ children }: MobileProps): JSX.Element {
  return (
    <Container
      data-testid="mobile-controls"
      sx={{
        display: {
          xs: 'block',
          lg: 'none'
        }
      }}
    >
      {children}
    </Container>
  )
}
