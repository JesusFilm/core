import { ReactElement, useEffect } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from 'firebase/compat/app'
import { getAuth } from 'firebase/auth'
import { useRouter } from 'next/router'
import { useLazyQuery, gql } from '@apollo/client'
import { firebaseClient, useFirebase } from '../../libs/firebaseClient'
import 'firebase/compat/auth'

export const ME = gql`
  query Me {
    me {
      id
    }
  }
`

export function SignIn(): ReactElement {
  const router = useRouter()
  const auth = getAuth(firebaseClient)
  const { user, loading } = useFirebase()
  const [callMe] = useLazyQuery(ME)

  useEffect(() => {
    // if user is logged in, redirect to home
    if (loading === false && user != null) {
      void router.push('/journeys')
    }

    // TODO: should we handle redirecting the user to the invite page if they have a pending invite?
  }, [loading, user, router])

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
      signInSuccessWithAuthResult: () => {
        callMe().catch((err) => console.log(err))
        return false
      }
    }
  }

  return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
}
