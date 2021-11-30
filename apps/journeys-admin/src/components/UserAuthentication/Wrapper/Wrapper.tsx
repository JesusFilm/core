import { ReactElement } from 'react'
import { SignIn } from '../SignIn'
import { Container, Typography } from '@mui/material'
import { Box } from '@mui/system'

export const Wrapper = (): ReactElement => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Typography variant="h4">Sign In</Typography>
        <SignIn />
      </Box>
    </Container>
  )
}
