import { ReactElement, useState } from 'react'
import { Register } from '../Register'
import { SignIn } from '../SignIn'
import { Button, Container } from '@mui/material'

export const Wrapper = (): ReactElement => {
  const [createAccount, setCreateAccount] = useState(false)
  // Add proper logic to render out different options for sign in or sign up
  // When schema is done
  return (
    <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column' }}>
      {!createAccount ? (
        <>
          <SignIn />
          <Button
            variant={'contained'}
            fullWidth={false}
            onClick={() => setCreateAccount(true)}
          >
            Create an account
          </Button>
        </>
      ) : (
        <Register />
      )}
    </Container>
  )
}
