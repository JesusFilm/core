import { ReactElement } from 'react'
import { Register } from '../Register'
import { Box } from '@mui/system'
import { SignIn } from '../SignIn'

export const Wrapper = (): ReactElement => {
  // Add logic to render out different options for sign in or sign up
  return (
    <Box>
      <Register />
      <SignIn />
    </Box>
  )
}
