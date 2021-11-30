import { ReactElement } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { firebaseClient } from '../../../libs/firebaseClient'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import { getAuth } from 'firebase/auth'
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

export function SignIn(): ReactElement {
  const auth = getAuth(firebaseClient)
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

  const uiConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: '/journeys',
    signInOptions: [
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID
      },
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        customParameters: {
          prompt: 'select_account'
        }
      },
      {
        provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        customParameters: {
          auth_type: 'reauthenticate'
        }
      }
    ],
    callbacks: {
      signInSuccessWithAuthResult: (response) => {
        const firstName = response.user.displayName
          .split(' ')
          .slice(0, -1)
          .join(' ')
        const lastName = response.user.displayName
          .split(' ')
          .slice(-1)
          .join(' ')
        const imageUrl =
          response.user.photoURL != null ? response.user.photoURL : ''

        handleAuthResponse(
          response.user.uid,
          firstName,
          lastName,
          response.user.email,
          imageUrl
        )

        return true
      }
    }
  }

  return (
    <StyledFirebaseAuth
      data-testid="firebaseui"
      uiConfig={uiConfig}
      firebaseAuth={auth}
    />
  )
}
