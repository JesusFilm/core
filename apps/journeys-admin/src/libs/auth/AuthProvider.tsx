'use client'

import { FunctionComponent } from 'react'

import { AuthContext, User } from './authContext'

export interface AuthProviderProps {
  user: User | null
  decodedToken?: Record<string, unknown> | null
  children: React.ReactNode
}

export const AuthProvider: FunctionComponent<AuthProviderProps> = ({
  user,
  decodedToken,
  children
}) => {
  return (
    <AuthContext.Provider
      value={{
        user,
        decodedToken
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
