import { ReactElement, useEffect } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { firebaseClient } from '../../../libs/firebaseClient'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import { getAuth } from 'firebase/auth'
import { FirebaseHandler } from '../../../libs/firebaseClient/FirebaseHandler'

export function SignIn(): ReactElement {
  const auth = getAuth(firebaseClient)
  const { updateUser } = FirebaseHandler()

  useEffect(() => {
    void updateUser()
  }, [updateUser])

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
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => true
    }
  }

  // write logic on setting persistence

  // auth
  //   .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  //   .then(function () {
  //     console.log('Local persistence set')
  //   })
  //   .catch(function (error) {
  //     console.log(error)
  //     console.log('Local persistence has not been set')
  //   })

  return (
    <StyledFirebaseAuth
      data-testid="firebaseui"
      uiConfig={uiConfig}
      firebaseAuth={auth}
    />
  )
}
