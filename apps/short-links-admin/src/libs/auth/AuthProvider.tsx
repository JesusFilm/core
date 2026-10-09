'use client'

import { ReactElement, ReactNode } from 'react'

import { AuthContext, User } from './authContext'

export interface AuthProviderProps {
  user: User | null
  children: ReactNode
}

export function AuthProvider({
  user,
  children
}: AuthProviderProps): ReactElement {
  return (
    <AuthContext.Provider
      value={{
        user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
