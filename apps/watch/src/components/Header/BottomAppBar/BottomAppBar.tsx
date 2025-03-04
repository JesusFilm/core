import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import { ReactElement } from 'react'

import { HeaderTabButtons } from '../HeaderTabButtons'

export function BottomAppBar(): ReactElement {
  return (
    <Container
      maxWidth="xl"
      disableGutters
      sx={{
        px: 4,
        color: 'text.primary',
        background: 'transparent',
        boxShadow: 'none'
      }}
    >
      <Toolbar disableGutters>
        <Box sx={{ width: '100%' }}>
          <HeaderTabButtons />
        </Box>
      </Toolbar>
    </Container>
  )
}
