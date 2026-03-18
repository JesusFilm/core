'use client'

import { onAuthStateChanged } from 'firebase/auth'
import { FunctionComponent, useEffect, useState } from 'react'

import { AuthContext, User } from './authContext'
import { getFirebaseAuth } from './firebase'

export interface AuthProviderProps {
  user: User | null
  children: React.ReactNode
}

export const AuthProvider: FunctionComponent<AuthProviderProps> = ({
  user: serverUser,
  children
}) => {
  const [clientUser, setClientUser] = useState<User | null>(null)

  useEffect(() => {
    const auth = getFirebaseAuth()
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser == null) {
        setClientUser(null)
        return
      }
      try {
        const token = await firebaseUser.getIdToken()
        setClientUser({
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber,
          emailVerified: firebaseUser.emailVerified,
          token,
          isAnonymous: firebaseUser.isAnonymous,
          providerId: firebaseUser.providerId
        })
      } catch {
        setClientUser(null)
      }
    })
  }, [])

  const user = serverUser ?? clientUser

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  )
}
