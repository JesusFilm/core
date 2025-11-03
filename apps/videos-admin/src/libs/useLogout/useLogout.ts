import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'

import { logout } from '../../app/api'
import { getFirebaseAuth } from '../auth/firebase'

interface UseLogoutProps {
  onSuccess?: () => void
}

export function useLogout(props?: UseLogoutProps): () => Promise<void> {
  const router = useRouter()
  return async () => {
    const auth = getFirebaseAuth()
    await signOut(auth)
    await logout()

    router.push('/user/sign-in')
    props?.onSuccess?.()
  }
}
