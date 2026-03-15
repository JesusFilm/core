import { UserInfo as FirebaseUserInfo } from 'firebase/auth'
import { createContext, useContext } from 'react'

export interface User extends FirebaseUserInfo {
  id: string
  emailVerified: boolean
  token: string
  isAnonymous: boolean
}

export interface AuthContextValue {
  user: User | null
  decodedToken?: Record<string, unknown> | null
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  decodedToken: null
})

export const useAuth = (): AuthContextValue => useContext(AuthContext)
