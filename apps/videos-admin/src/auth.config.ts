import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
            {
              method: 'POST',
              body: JSON.stringify(credentials),
              headers: { 'Content-Type': 'application/json' }
            }
          )
          return await response.json()
        } catch (e) {
          return null
        }
      }
    }),
    Google(
      process.env.NODE_ENV !== 'production'
        ? {
            authorization: {
              params: {
                prompt: 'consent',
                access_type: 'offline',
                response_type: 'code'
              }
            }
          }
        : {}
    )
  ],
  theme: {
    colorScheme: 'light' // "auto" | "dark" | "light"
  },
  secret: process.env.NEXT_PUBLIC_AUTH_CONFIG_SECRET,
  callbacks: {
    jwt({ token, user }) {
      if (user != null) token.id = user.id
      return token
    },
    session: async ({ session, token, user }) => {
      console.log(session)
      console.log(token)
      console.log(user)
      if (token.id != null) session.user.id = token.id as string
      if (user != null) session.user.id = user.id
      return session
    }
  }
} satisfies NextAuthConfig
