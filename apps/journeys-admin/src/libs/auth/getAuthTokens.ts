import { GetServerSidePropsContext } from 'next'
import { Tokens, getTokens } from 'next-firebase-auth-edge'

import { allowedHost } from '@core/journeys/ui/allowedHost'

import { User } from './authContext'
import { authConfig } from './config'

function createCookiesAdapter(cookies: Partial<{ [key: string]: string }>): {
  get(name: string): { name: string; value: string } | undefined
  getAll(): Array<{ name: string; value: string }>
  has(name: string): boolean
} {
  return {
    get(name: string) {
      const value = cookies[name]
      return value != null ? { name, value } : undefined
    },
    getAll() {
      return Object.entries(cookies)
        .filter(([, value]) => value != null)
        .map(([name, value]) => ({ name, value: value! }))
    },
    has(name: string) {
      return cookies[name] != null
    }
  }
}

export function toUser(tokens: Tokens): User {
  const {
    uid,
    email,
    name: displayName,
    picture: photoURL,
    email_verified: emailVerified,
    phone_number: phoneNumber
  } = tokens.decodedToken

  return {
    id: uid,
    email: email ?? null,
    displayName: displayName ?? null,
    photoURL: photoURL ?? null,
    phoneNumber: phoneNumber ?? null,
    emailVerified: emailVerified ?? false,
    token: tokens.token
  }
}

export async function getAuthTokens(
  ctx: GetServerSidePropsContext
): Promise<Tokens | null> {
  const cookies = createCookiesAdapter(ctx.req.cookies)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getTokens(cookies as any, authConfig)
}

export function redirectToLogin(ctx: GetServerSidePropsContext): {
  redirect: { permanent: false; destination: string }
} {
  const redirectUrl = ctx.resolvedUrl
  return {
    redirect: {
      permanent: false,
      destination: `/users/sign-in?redirect=${encodeURIComponent(redirectUrl)}`
    }
  }
}

const ALLOWED_REDIRECT_HOSTS = [
  'localhost:4200',
  'admin.nextstep.is',
  'admin-stage.nextstep.is'
]

export function redirectToApp(ctx: GetServerSidePropsContext): {
  redirect: { permanent: false; destination: string }
} {
  const redirectParam =
    typeof ctx.query.redirect === 'string' ? ctx.query.redirect : null

  if (redirectParam != null) {
    try {
      const redirectUrl = decodeURIComponent(redirectParam)
      if (allowedHost(new URL(redirectUrl).host, ALLOWED_REDIRECT_HOSTS)) {
        return {
          redirect: { permanent: false, destination: redirectUrl }
        }
      }
    } catch {
      // invalid URL, fall through to default
    }
  }

  return {
    redirect: { permanent: false, destination: '/' }
  }
}
