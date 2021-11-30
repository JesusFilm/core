import { ReactElement } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { firebaseClient } from '../../../libs/firebaseClient'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import { getAuth } from 'firebase/auth'
// import { useMutation, gql } from '@apollo/client'
// import { UserCreate } from '../../../../__generated__/UserCreate'

export function SignIn(): ReactElement {
  const auth = getAuth(firebaseClient)

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

// const [userCreate] = useMutation<UserCreate>(USER_CREATE)

// const handleAuthResponse = (
//   id: string,
//   firstName?: string,
//   lastName?: string,
//   email?: string,
//   imageUrl?: string
// ): void => {
//   void userCreate({
//     variables: {
//       input: {
//         id,
//         firstName,
//         lastName,
//         email,
//         imageUrl
//       },
//       optimisticResponse: {
//         userCreate: {
//           id: id,
//           firstName: firstName,
//           lastName: lastName,
//           email: email,
//           imageUrl: imageUrl
//         }
//       }
//     }
//   })
// }
