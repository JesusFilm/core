import { createContext, useContext } from 'react'

export interface User {
  id: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  phoneNumber: string | null
  emailVerified: boolean
  token: string
  isAnonymous: boolean
}

export interface AuthContextValue {
  user: User | null
}

export const AuthContext = createContext<AuthContextValue>({
  user: null
})

export const useAuth = (): AuthContextValue => useContext(AuthContext)
