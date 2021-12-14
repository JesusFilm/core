import { ReactElement, useEffect } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { firebaseClient, UseFirebase } from '../../libs/firebaseClient'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import { getAuth } from 'firebase/auth'
import { useRouter } from 'next/router'
import { useMutation, gql } from '@apollo/client'
import { UserCreate } from '../../../__generated__/UserCreate'

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
  const router = useRouter()
  const auth = getAuth(firebaseClient)
  const [userCreate] = useMutation<UserCreate>(USER_CREATE)
  const { user, loading } = UseFirebase()

  useEffect(() => {
    // if user is logged in, redirect to home
    if (loading === false && user != null) {
      void router.push('/journeys')
    }

    // TODO: should we handle redirecting the user to the invite page if they have a pending invite?
  }, [loading, user, router])

  const handleAuthResponse = (
    id: string,
    firstName?: string,
    lastName?: string,
    email?: string,
    imageUrl?: string
  ): void => {
    let requestInviteToJourneyId
    try {
      requestInviteToJourneyId = localStorage.getItem('pendingInviteRequest')
    } catch (e) {
      console.log('on server')
    }
    void userCreate({
      variables: {
        input: {
          id,
          firstName,
          lastName,
          email,
          imageUrl,
          requestInviteToJourneyId
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
        provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID
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

        void router.push('/journeys')
        return true
      }
    }
  }

  return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
}
