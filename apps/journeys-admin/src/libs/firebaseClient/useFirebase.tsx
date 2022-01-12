import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'
import { firebaseClient } from './firebaseClient'

interface UseFirebaseResponse {
  logOut: () => void
  user
  loading
  error
}

export const useFirebase = (): UseFirebaseResponse => {
  const router = useRouter()
  const auth = getAuth(firebaseClient)
  const [user, loading, error] = useAuthState(auth)

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
    loading,
    error
  }
}
