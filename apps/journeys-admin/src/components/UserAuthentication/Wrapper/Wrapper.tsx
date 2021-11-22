import { ReactElement, useState } from 'react'
import { Register } from '../Register'
import { SignIn } from '../SignIn'
import { Container, Link, Typography } from '@mui/material'
import { Box } from '@mui/system'

export const Wrapper = (): ReactElement => {
  const [createAccount, setCreateAccount] = useState(false)

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
        {!createAccount ? (
          <>
            <Typography variant="h4">Sign In</Typography>
            <SignIn />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row'
              }}
            >
              <Typography>Need to create an account? </Typography>
              <Link href="#" onClick={() => setCreateAccount(true)}>
                Sign Up
              </Link>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h4">Sign up</Typography>
            <Register />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row'
              }}
            >
              <Typography>Already have an account? </Typography>
              <Link href="#" onClick={() => setCreateAccount(false)}>
                Sign In
              </Link>
            </Box>
          </>
        )}
      </Box>
    </Container>
  )
}
