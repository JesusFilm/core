import { createContext, useContext } from 'react'

import type { User as GetUserUser } from '@/libs/auth/getUser/query'

export type User = GetUserUser
export interface AuthContextValue {
  user: User | null
}

export const AuthContext = createContext<AuthContextValue>({
  user: null
})

export const useAuth = (): AuthContextValue => useContext(AuthContext)
