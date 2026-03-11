'use client'

import { FunctionComponent } from 'react'

import { AuthContext, User } from './authContext'

export interface AuthProviderProps {
  user: User | null
  children: React.ReactNode
}

export const AuthProvider: FunctionComponent<AuthProviderProps> = ({
  user,
  children
}) => {
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
