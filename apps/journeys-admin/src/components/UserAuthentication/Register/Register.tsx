import { ReactElement, useState } from 'react'
import { Alert, Button, Container, Grid, TextField } from '@mui/material'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { firebaseClient, UseFirebase } from '../../../libs/firebaseClient'
import { useMutation, gql } from '@apollo/client'
import { UserCreate } from '../../../../__generated__/UserCreate'

export const USER_CREATE = gql`
  mutation UserCreate($input: UserCreateInput!) {
    userCreate(input: $input) {
      id
      firstName
      lastName
      email
      imageUrl
    }
  }
`

export const Register = (): ReactElement => {
  const [firstName, setFirstName] = useState<string>()
  const [lastName, setLastName] = useState<string>()
  const [email, setEmail] = useState<string>()
  const [password, setPassword] = useState<string>()
  const [error, setError] = useState<string>()
  const auth = getAuth(firebaseClient)
  const { user } = UseFirebase()
  const [userCreate] = useMutation<UserCreate>(USER_CREATE)

  const handleAuthResponse = (
    id: string,
    firstName?: string,
    lastName?: string,
    email?: string,
    imageUrl?: string
  ): void => {
    void userCreate({
      variables: {
        input: {
          id,
          firstName,
          lastName,
          email,
          imageUrl
        },
        optimisticResponse: {
          userCreate: {
            id: id,
            firstName: firstName,
            lastName: lastName,
            email: email,
            imageUrl: imageUrl
          }
        }
      }
    })
  }

  console.log(user.uid)

  const handleSignUp = async (event): Promise<void> => {
    event.preventDefault()

    if (email !== undefined && password !== undefined) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          console.log('User created')
        })
        .catch((error) => {
          setError(error.message)
        })
    }

    handleAuthResponse(user.uid, firstName, lastName, email, user.photoURL)
  }

  return (
    <Container maxWidth="xs">
      {error != null && error && <Alert severity="error">{error}</Alert>}
      <form>
        <Grid container spacing={2}>
          <Grid item xs={6}>
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
          <Grid item xs={6}>
            <TextField
              variant="outlined"
              fullWidth
              required
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
