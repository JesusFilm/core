import { ReactElement } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { firebaseClient, useAuth } from '../../../libs/firebaseClient'
import 'firebase/compat/auth'

export function SignIn(): ReactElement {
  const { signInConfig } = useAuth()

  // TODO:
  // Add types when ready

  return (
    <StyledFirebaseAuth
      uiConfig={signInConfig}
      firebaseAuth={firebaseClient.auth()}
    />
  )
}
