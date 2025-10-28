import { useUser } from 'next-firebase-auth'
import { useMemo } from 'react'

export function useAuthUser() {
  const user = useUser()

  return useMemo(
    () => ({
      user,
      isAuthenticated: user?.id != null && user.id.length > 0
    }),
    [user]
  )
}
