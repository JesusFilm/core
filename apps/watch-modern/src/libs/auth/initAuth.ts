import absoluteUrl from 'next-absolute-url'
import { init } from 'next-firebase-auth'

import {
  authCookieName,
  authCookiesConfig,
  firebaseAdminConfig,
  firebaseClientConfig
} from './config'

let initialized = false

const buildRedirectUrl = (input: string, origin: string): string => {
  try {
    const url = new URL(input, origin)
    return url.toString()
  } catch (error) {
    console.warn('Failed to construct redirect URL. Falling back to studio home.', error)
    return `${origin}/studio/new`
  }
}

const isAllowedRedirect = (target: string, originHost: string): boolean => {
  try {
    const url = new URL(target)
    return url.host === originHost
  } catch {
    return false
  }
}

export const initAuth = (): void => {
  if (initialized) return

  init({
    debug: process.env.NODE_ENV === 'development',
    loginAPIEndpoint: '/studio/api/login',
    logoutAPIEndpoint: '/studio/api/logout',
    onLoginRequestError: (error) => {
      console.error('Failed to log in via next-firebase-auth.', error)
    },
    firebaseAdminInitConfig: {
      credential: firebaseAdminConfig.credential,
      databaseURL: ''
    },
    firebaseClientInitConfig: firebaseClientConfig,
    cookies: authCookiesConfig,
    authPageURL: ({ ctx }) => {
      const isServerSide = typeof window === 'undefined'
      const origin = isServerSide ? absoluteUrl(ctx?.req).origin : window.location.origin
      const redirectPath = isServerSide ? ctx?.resolvedUrl ?? '/' : window.location.href
      const redirectUrl = buildRedirectUrl(redirectPath, origin)

      return `/studio/users/sign-in?redirect=${encodeURIComponent(redirectUrl)}`
    },
    appPageURL: ({ ctx }) => {
      const isServerSide = typeof window === 'undefined'
      const origin = isServerSide ? absoluteUrl(ctx?.req).origin : window.location.origin
      const originHost = new URL(origin).host
      const params = isServerSide
        ? new URL(ctx?.req.url ?? '/', origin).searchParams
        : new URLSearchParams(window.location.search)
      const encodedRedirect = params.get('redirect')

      if (encodedRedirect != null) {
        const redirect = decodeURIComponent(encodedRedirect)
        if (isAllowedRedirect(redirect, originHost)) {
          return redirect
        }
        console.warn('Blocked unsafe redirect attempt after authentication.', redirect)
      }

      return '/studio/new'
    },
    cookiesRedirectAllowedDomains: [
      'localhost:3000',
      'localhost:4200',
      process.env.VERCEL_URL,
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'prod'
        ? process.env.VERCEL_PROJECT_PRODUCTION_URL
        : undefined
    ].filter(Boolean) as string[]
  })

  initialized = true
  if (process.env.NODE_ENV === 'development') {
    console.info('WatchModern authentication initialized.')
  }
}

export const authCookieHeaderName = `${authCookieName}.AuthUser`
