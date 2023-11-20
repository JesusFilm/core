import absoluteUrl from 'next-absolute-url'
import { init } from 'next-firebase-auth'

import { allowedHost } from '@core/journeys/ui/allowedHost'

export function initAuth(): void {
  init({
    loginAPIEndpoint: '/api/login',
    logoutAPIEndpoint: '/api/logout',
    firebaseAdminInitConfig: {
      credential: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
        clientEmail: process.env.PRIVATE_FIREBASE_CLIENT_EMAIL ?? '',
        privateKey: process.env.PRIVATE_FIREBASE_PRIVATE_KEY ?? ''
      },
      databaseURL: ''
    },
    firebaseClientInitConfig: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    },
    cookies: {
      name: 'journeys-admin',
      keys: [
        process.env.COOKIE_SECRET_CURRENT,
        process.env.COOKIE_SECRET_PREVIOUS
      ],
      httpOnly: true,
      maxAge: 12 * 60 * 60 * 24 * 1000,
      overwrite: true,
      path: '/',
      sameSite: 'strict',
      secure:
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ||
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',
      signed: true
    },
    authPageURL: ({ ctx }) => {
      const isServerSide = typeof window === 'undefined'
      const origin = isServerSide
        ? absoluteUrl(ctx?.req).origin
        : window.location.origin
      const redirectPath =
        typeof window === 'undefined' ? ctx?.resolvedUrl : window.location.href
      const redirectUrl = new URL(redirectPath ?? '', origin)
      return `/users/sign-in?redirect=${encodeURIComponent(
        redirectUrl.toString()
      )}`
    },
    appPageURL: ({ ctx }) => {
      const isServerSide = typeof window === 'undefined'
      const origin = isServerSide
        ? absoluteUrl(ctx?.req).origin
        : window.location.origin
      const params = isServerSide
        ? new URL(ctx?.req.url ?? '', origin).searchParams
        : new URLSearchParams(window.location.search)
      const encodedRedirectUrl = params.get('redirect')
      const redirectUrl =
        encodedRedirectUrl != null
          ? decodeURIComponent(encodedRedirectUrl)
          : undefined

      if (redirectUrl != null) {
        // Verify the redirect URL host is allowed.
        // https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/11-Client_Side_Testing/04-Testing_for_Client_Side_URL_Redirect
        const tests = [
          'localhost:4200',
          'admin.nextstep.is',
          'admin-stage.nextstep.is'
        ]
        if (allowedHost(new URL(redirectUrl).host, tests)) {
          return redirectUrl
        }
      }
      return '/'
    }
  })
}
