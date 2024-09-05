'use client'

import { ReactNode } from 'react'

import { AuthContext, User } from './authContext'

export interface AuthProviderProps {
  user: User | null
  children: React.ReactNode
}

export const AuthProvider = ({ user, children }): ReactNode => {
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
