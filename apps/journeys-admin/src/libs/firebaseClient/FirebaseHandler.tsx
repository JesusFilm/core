import { getAuth, signOut } from 'firebase/auth'
import { firebaseClient } from './firebaseClient'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useRouter } from 'next/router'

interface FirebaseHandlerProps {
  logOut: () => void
  updateUser: () => void
  getCurrentUser: boolean
}

export const FirebaseHandler = (): FirebaseHandlerProps => {
  const router = useRouter()
  const auth = getAuth(firebaseClient)
  const [user] = useAuthState(auth)

  const logOut = async (): Promise<void> => {
    void signOut(auth)
      .then(() => {
        // sign out user
        // void auth.updateCurrentUser(null)
        void router.push('/')
      })
      .catch((error) => {
        console.log(error.message)
      })
  }

  const updateUser = (): void => {
    if (user != null && auth !== undefined) {
      void auth.updateCurrentUser(user.displayName)
      console.log(user.displayName)
    }
  }

  const getCurrentUser = true

  return {
    logOut,
    updateUser,
    getCurrentUser
  }
}
