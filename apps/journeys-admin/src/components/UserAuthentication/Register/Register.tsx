import { Button, Container, Typography, Grid, TextField } from '@mui/material'
import { ReactElement, useState } from 'react'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

export const Register = (): ReactElement => {
  const [email, setEmail] = useState<string>()
  const [password, setPassword] = useState<string>()

  const signUp = (event): void => {
    event.preventDefault()

    const auth = getAuth()
    if (email !== undefined && password !== undefined) {
      void createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // check
          console.log(userCredential.user)
        })
        .catch((error) => {
          console.log(error.message)
        })
    }
  }

  // MUI components used are just for testing purposes and is not the set components that will be used
  return (
    <Container maxWidth="xs">
      <Typography variant="h5">Sign Up</Typography>
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
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
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            onClick={signUp}
          >
            Sign Up
          </Button>
        </Grid>
      </form>
    </Container>
  )
}
