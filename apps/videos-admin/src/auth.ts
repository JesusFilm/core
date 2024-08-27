import { FirestoreAdapter } from '@auth/firebase-adapter'
import NextAuth from 'next-auth'

import { authConfig } from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: FirestoreAdapter({
    credential: JSON.parse(process.env.FIREBASE_APPLICATION_JSON as string)
  })
})
