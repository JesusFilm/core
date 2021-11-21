import { ReactElement, useState } from 'react'
import {
  Alert,
  Button,
  Container,
  Typography,
  Grid,
  TextField
} from '@mui/material'
import { useAuth } from '../../../libs/firebaseClient'

export const Register = (): ReactElement => {
  const [firstName, setFirstName] = useState<string>()
  const [lastName, setLastName] = useState<string>()
  const [email, setEmail] = useState<string>()
  const [password, setPassword] = useState<string>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)

  const { signUp, handleAuthResponse } = useAuth()

  // TODO:
  // Add backend types when ready
  // Create mutation here for adding a new user to our backend
  // create the remaining needed fields

  const handleSignUp = async (event): Promise<void> => {
    event.preventDefault()

    // Pass in first and last name to the backend when ready
    if (firstName !== undefined && lastName !== undefined) {
      console.log(`${firstName} ${lastName}`)
    }

    try {
      setLoading(true)
      await signUp(email, password)
      // handleAuthResponse(firstName, lastName, email)
    } catch {
      setError('Failed to create an account')
    }

    setLoading(false)
  }

  // MUI components used are just for testing purposes and is not the set components that will be used
  return (
    <Container maxWidth="xs">
      <Typography variant="h5">Sign Up</Typography>
      {error != null && error && <Alert severity="error">{error}</Alert>}
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="first-name"
              label="First Name"
              name="first-name"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="last-name"
              label="Last Name"
              name="last-name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
          <Button
            type="submit"
            disabled={loading}
            fullWidth
            variant="contained"
            color="primary"
            onClick={async (e) => await handleSignUp(e)}
          >
            Sign Up
          </Button>
        </Grid>
      </form>
    </Container>
  )
}
