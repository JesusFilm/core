import NextAuth from 'next-auth'
import type { Provider } from 'next-auth/providers'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'

export const providers: Provider[] = [
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
        const res = await response.json()
        if ('error' in res) throw new Error(res.error.reason as string)
        return res
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
]

export const providerMap = providers.map((provider) => {
  if (typeof provider === 'function') {
    const providerData = provider()
    return { id: providerData.id, name: providerData.name }
  }
  return { id: provider.id, name: provider.name }
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  secret: process.env.NEXT_PUBLIC_AUTH_CONFIG_SECRET,
  pages: {
    signIn: '/auth/login'
  },
  callbacks: {
    authorized: ({ auth }) => auth?.user != null
  }
})
