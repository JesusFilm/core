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
      try {
        if (firebaseUser == null) {
          setClientUser(null)
          return
        }

        const token = await firebaseUser.getIdToken()
        setClientUser(toClientUser(firebaseUser, token))

        const isFirstClientUser = previousUidRef.current == null
        const isServerSessionMissingOrMismatched =
          serverUser == null || serverUser.id !== firebaseUser.uid
        const shouldReestablishServerSession =
          isFirstClientUser && isServerSessionMissingOrMismatched

        if (!shouldReestablishServerSession) {
          return
        }

        const loginResponse = await fetch('/api/login', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        })

        if (loginResponse.ok) {
          window.location.reload()
          return
        }

        console.error('Failed to reestablish server session via /api/login', {
          status: loginResponse.status
        })
      } catch (error) {
        console.error(
          'Failed to hydrate auth state from onIdTokenChanged',
          error
        )
      } finally {
        previousUidRef.current = firebaseUser?.uid ?? null
        setHasHydratedAuth(true)
      }
    })
  }, [])

  const user = hasHydratedAuth ? clientUser : (serverUser ?? clientUser)

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  )
}
