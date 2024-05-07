import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'

import { PlausibleFilter } from '../PlausibleFilter'
import { PlausibleLocalProvider } from '../PlausibleLocalProvider'
import { PlausibleTopCards } from '../PlausibleTopCards'

interface PlausibleDashboardProps {
  children?: ReactNode
}

export function PlausibleDashboard({
  children
}: PlausibleDashboardProps): ReactElement {
  return (
    <PlausibleLocalProvider>
      <Container sx={{ py: 5 }}>
        <Stack spacing={5}>
          <PlausibleFilter />
          <PlausibleTopCards />
          {children}
        </Stack>
      </Container>
    </PlausibleLocalProvider>
  )
}
