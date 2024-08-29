import type { NextAuthConfig, Session, User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'

export interface VideoSession extends Session {
  user: VideoUser
}

interface VideoUser extends User {
  token: string
}

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
    jwt({ token, profile, user, account, session }) {
      // console.log('session', session)
      // console.log('token', token)
      // console.log('user', user)
      // console.log('profile', profile)
      // console.log('account', account)
      // google auth id
      if (account != null) token._id = account.id_token
      return token
    },
    session: async ({ session, token, user }) => {
      if (token._id != null) session.user.token = token._id as string
      // console.log('session', session)
      // if (user != null) session.user.id = user.id
      return session as Session
    }
  }
} satisfies NextAuthConfig
