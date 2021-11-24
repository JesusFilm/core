import { ReactElement, useState } from 'react'
import { Alert, Button, Container, Grid, TextField } from '@mui/material'
import { getAuth } from 'firebase/auth'
import { firebaseClient } from '../../../libs/firebaseClient'
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth'

export const Register = (): ReactElement => {
  const [firstName, setFirstName] = useState<string>()
  const [lastName, setLastName] = useState<string>()
  const [email, setEmail] = useState<string | undefined>()
  const [password, setPassword] = useState<string>()
  const auth = getAuth(firebaseClient)
  const [createUserWithEmailAndPassword, error, loading] =
    useCreateUserWithEmailAndPassword(auth)

  const handleSignUp = async (event): Promise<void> => {
    event.preventDefault()

    console.log(firstName, lastName)

    // handle loading state

    email !== undefined &&
      password !== undefined &&
      createUserWithEmailAndPassword(email, password)
    // handleAuthResponse(firstName, lastName, email)
  }

  // MUI components used are just for testing purposes and is not the set components that will be used
  return (
    <Container maxWidth="xs">
      {error != null && error && (
        <Alert severity="error">{error.message}</Alert>
      )}
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

// TODO: Include code below once backend is ready

// import { useMutation, gql } from '@apollo/client'

// const [userCreate] = useMutation<UserCreate>(USER_CREATE)

// export const USER_CREATE = gql`
//   mutation UserCreate($input: UserCreateInput!) {
//     userCreate(input: $input) {
//       id
//       firebaseId
//       firstName
//       lastName
//       email
//       imageUrl
//     }
//   }
// `

// const handleAuthResponse = (
//   firstName?: string,
//   lastName?: string,
//   email?: string
// ): void => {
//   void userCreate({
//     variables: {
//       input: {
//         firebaseId,
//         firstName,
//         lastName,
//         email,
//         imageUrl
//       },
//       optimisticResponse: {
//         userCreate: {
//           firebaseId: firebaseId,
//           firstName: firstName,
//           lastName: lastName,
//           email: email,
//           imageUrl: imageUrl
//         }
//       }
//     }
//   })
// }
