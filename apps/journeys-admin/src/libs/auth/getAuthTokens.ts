import { GetServerSidePropsContext } from 'next'
import { Tokens, getTokensFromObject } from 'next-firebase-auth-edge'

import { allowedHost } from '@core/journeys/ui/allowedHost'

import { TAILSCALE_HOST_PATTERN } from '../tailscaleHostPattern'

import { User } from './authContext'
import { authConfig } from './config'

export function toUser(tokens: Tokens): User {
  const {
    uid,
    email,
    name: displayName,
    picture: photoURL,
    email_verified: emailVerified,
    phone_number: phoneNumber,
    provider_id: providerId
  } = tokens.decodedToken

  return {
    id: uid,
    uid,
    email: email ?? null,
    displayName: displayName ?? null,
    photoURL: photoURL ?? null,
    phoneNumber: phoneNumber ?? null,
    emailVerified: emailVerified ?? false,
    token: tokens.token,
    isAnonymous: tokens.decodedToken.firebase.sign_in_provider === 'anonymous',
    providerId: typeof providerId === 'string' ? providerId : ''
  }
}

export async function getAuthTokens(
  ctx: GetServerSidePropsContext
): Promise<Tokens | null> {
  try {
    return await getTokensFromObject(ctx.req.cookies, authConfig)
  } catch {
    return null
  }
}

export function redirectToLogin(ctx: GetServerSidePropsContext): {
  redirect: { permanent: false; destination: string }
} {
  const url = new URL(ctx.resolvedUrl, 'https://admin.nextstep.is')
  const existingRedirect = url.searchParams.get('redirect')
  const redirectTarget = existingRedirect ?? `${url.pathname}${url.search}`

  return {
    redirect: {
      permanent: false,
      destination: `/users/sign-in?redirect=${encodeURIComponent(redirectTarget)}`
    }
  }
}

const ALLOWED_REDIRECT_HOSTS = [
  'localhost:4200',
  'admin.nextstep.is',
  'admin-stage.nextstep.is'
]

/**
 * In dev, Tailscale MagicDNS hostnames (`tailscale-*`) need to round-trip
 * through the sign-in redirect flow. The prefix is the dev-only opt-in
 * marker — see docs/development/tailscale-dev-access.md.
 */
export function isAllowedRedirectHost(host: string): boolean {
  if (allowedHost(host, ALLOWED_REDIRECT_HOSTS)) return true
  if (
    process.env.NODE_ENV !== 'production' &&
    TAILSCALE_HOST_PATTERN.test(host)
  )
    return true
  return false
}

export function redirectToApp(ctx: GetServerSidePropsContext): {
  redirect: { permanent: false; destination: string }
} {
  const redirectParam =
    typeof ctx.query.redirect === 'string' ? ctx.query.redirect : null

  if (redirectParam != null) {
    try {
      const redirectUrl = decodeURIComponent(redirectParam)
      if (redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
        return {
          redirect: { permanent: false, destination: redirectUrl }
        }
      }
      if (isAllowedRedirectHost(new URL(redirectUrl).host)) {
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
