import { getAuth, signOut } from 'firebase/auth'
import { firebaseClient } from './firebaseClient'
import { useRouter } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'

interface UseFirebaseProps {
  logOut: () => void
  user
  loading
}

export const UseFirebase = (): UseFirebaseProps => {
  const router = useRouter()
  const auth = getAuth(firebaseClient)
  const [user, loading] = useAuthState(auth)

  const logOut = async (): Promise<void> => {
    void signOut(auth)
      .then(() => {
        void router.push('/')
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  return {
    logOut,
    user,
    loading
  }
}
