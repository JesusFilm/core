import { getAuth, signOut } from 'firebase/auth'
import { firebaseClient } from './firebaseClient'
import { useRouter } from 'next/router'

interface FirebaseHandlerProps {
  logOut: () => void
}

export const FirebaseHandler = (): FirebaseHandlerProps => {
  const router = useRouter()
  const auth = getAuth(firebaseClient)

  const logOut = async (): Promise<void> => {
    void signOut(auth)
      .then(() => {
        void router.push('/')
      })
      .catch((error) => {
        console.log(error.message)
      })
  }

  return {
    logOut
  }
}
