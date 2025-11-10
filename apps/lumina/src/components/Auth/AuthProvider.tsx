'use client'

import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth'
import { useEffect, useState } from 'react'

import { getFirebaseAuth } from '@/libs/auth/firebase'

import { AuthContext, User } from '@/libs/auth/authContext'

interface AuthProviderProps {
  children: React.ReactNode
  initialUser: User | null
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)

  useEffect(() => {
    const auth = getFirebaseAuth()
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser != null) {
          const token = await firebaseUser.getIdToken()
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            phoneNumber: firebaseUser.phoneNumber,
            emailVerified: firebaseUser.emailVerified,
            providerId: firebaseUser.providerData[0]?.providerId ?? null,
            customClaims: {},
            token
          }
          setUser(userData)
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  )
}
