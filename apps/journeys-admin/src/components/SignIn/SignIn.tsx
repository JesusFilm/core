import { ReactElement } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { firebaseClient } from '../../libs/firebaseClient'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import { getAuth } from 'firebase/auth'
import { useRouter } from 'next/router'

export function SignIn(): ReactElement {
  const auth = getAuth(firebaseClient)
  const router = useRouter()

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
        void router.push('/journeys')
        return true
      }
    }
  }

  return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
}
