import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { Header } from './Header'
import { Nav } from './Nav'

export function PageWrapper({ children }): ReactElement {
  return (
    <Stack sx={{ height: '100%' }} direction="row">
      <Nav />
      <Stack direction="column" width="100%">
        <Header />
        <Container sx={{ my: 10, maxHeight: '100%' }}>{children}</Container>
      </Stack>
    </Stack>
  )
}
