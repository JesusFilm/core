import { ReactElement } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { firebaseClient } from '../../../libs/firebaseClient'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import { getAuth } from 'firebase/auth'

export function SignIn(): ReactElement {
  const auth = getAuth(firebaseClient)

  const uiConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: '/journeys',
    signInOptions: [
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        disableSignUp: {
          status: true
        }
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
    ]
  }

  return (
    <StyledFirebaseAuth
      data-testid="firebaseui"
      uiConfig={uiConfig}
      firebaseAuth={auth}
    />
  )
}
