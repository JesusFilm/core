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
    token
  }
}

export function AuthProvider({
  user: serverUser,
  children
}: AuthProviderProps): ReactNode {
  const [clientUser, setClientUser] = useState<User | null>(null)
  const initializedRef = useRef(false)

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

        if (initializedRef.current) {
          await fetch('/api/login', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
          })
          window.location.reload()
        }
      } else {
        setClientUser(null)
      }

      initializedRef.current = true
    })
  }, [])

  const user = serverUser ?? clientUser

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  )
}
