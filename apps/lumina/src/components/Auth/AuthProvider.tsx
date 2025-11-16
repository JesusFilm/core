'use client'

import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { useEffect, useState, useRef } from 'react'

import { getFirebaseAuth } from '@/libs/auth/firebase'

import { AuthContext, type User } from '@/libs/auth/authContext'
import { getUser } from '@/libs/auth/getUser/client-getUser'

interface AuthProviderProps {
  children: React.ReactNode
  initialUser: User | null
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const isInitialMount = useRef(true)

  useEffect(() => {
    const auth = getFirebaseAuth()
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser != null) {
          const userData = await getUser()
          if (userData != null) {
            setUser(userData)
          }
        } else {
          if (isInitialMount.current) {
            isInitialMount.current = false
            if (initialUser != null) {
              return
            }
          }
          setUser(null)
        }
      }
    )

    return () => {
      unsubscribe()
    }
  }, [initialUser])

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  )
}
