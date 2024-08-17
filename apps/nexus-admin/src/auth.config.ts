import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.PUBLIC_FIREBASE_API_KEY}`,
            { method: 'POST', body: JSON.stringify(credentials) }
          )
          const json = await response.json()
          return json.data
        } catch (e) {
          return null
        }
      }
    }),
    Google
  ]
} satisfies NextAuthConfig
