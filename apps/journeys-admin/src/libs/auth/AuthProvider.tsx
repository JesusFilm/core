'use client'

import { User as FirebaseUser, getAuth, onIdTokenChanged } from 'firebase/auth'
import { ReactNode, useEffect, useRef, useState } from 'react'

import { AuthContext, User } from './authContext'

export interface AuthProviderProps {
  user: User | null
  children: ReactNode
}

function toClientUser(firebaseUser: FirebaseUser, token: string): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    phoneNumber: firebaseUser.phoneNumber,
    emailVerified: firebaseUser.emailVerified,
    token,
    isAnonymous: firebaseUser.isAnonymous
  }
}

export function AuthProvider({
  user: serverUser,
  children
}: AuthProviderProps): ReactNode {
  const [clientUser, setClientUser] = useState<User | null>(null)
  const [hasHydratedAuth, setHasHydratedAuth] = useState(false)
  const previousUidRef = useRef<string | null>(null)

  useEffect(() => {
    let auth
    try {
      auth = getAuth()
    } catch {
      return
    }

    return onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser != null) {
        const token = await firebaseUser.getIdToken()
        setClientUser(toClientUser(firebaseUser, token))

        const isFirstClientUser = previousUidRef.current == null
        const isServerSessionMissingOrMismatched =
          serverUser == null || serverUser.id !== firebaseUser.uid
        const shouldReestablishServerSession =
          isFirstClientUser && isServerSessionMissingOrMismatched

        if (shouldReestablishServerSession) {
          await fetch('/api/login', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
          })
          window.location.reload()
        }
      } else {
        setClientUser(null)
      }

      previousUidRef.current = firebaseUser?.uid ?? null
      setHasHydratedAuth(true)
    })
  }, [])

  const user = hasHydratedAuth ? clientUser : (serverUser ?? clientUser)

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  )
}
