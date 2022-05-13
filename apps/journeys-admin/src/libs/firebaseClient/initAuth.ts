import { init } from 'next-firebase-auth'
import absoluteUrl from 'next-absolute-url'
import firebaseClientInitConfig from '../../../secrets/firebase.json'

export function initAuth(): void {
  init({
    loginAPIEndpoint: '/api/login',
    logoutAPIEndpoint: '/api/logout',
    firebaseAdminInitConfig: {
      credential: {
        projectId: process.env.PRIVATE_GOOGLE_APPLICATION_PROJECT_ID ?? '',
        clientEmail: process.env.PRIVATE_GOOGLE_APPLICATION_CLIENT_EMAIL ?? '',
        privateKey: process.env.PRIVATE_GOOGLE_APPLICATION_PRIVATE_KEY ?? ''
      },
      databaseURL: ''
    },
    firebaseClientInitConfig,
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
        ? absoluteUrl(ctx.req).origin
        : window.location.origin
      const redirectPath =
        typeof window === 'undefined' ? ctx.resolvedUrl : window.location.href
      const redirectUrl = new URL(redirectPath, origin)
      return `/users/sign-in?redirect=${encodeURIComponent(
        redirectUrl.toString()
      )}`
    },
    appPageURL: ({ ctx }) => {
      const isServerSide = typeof window === 'undefined'
      const origin = isServerSide
        ? absoluteUrl(ctx.req).origin
        : window.location.origin
      const params = isServerSide
        ? new URL(ctx.req.url ?? '', origin).searchParams
        : new URLSearchParams(window.location.search)
      const encodedRedirectUrl = params.get('redirect')
      const redirectUrl =
        encodedRedirectUrl != null
          ? decodeURIComponent(encodedRedirectUrl)
          : undefined

      if (redirectUrl != null) {
        // Verify the redirect URL host is allowed.
        // https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/11-Client_Side_Testing/04-Testing_for_Client_Side_URL_Redirect
        const allowedHosts = ['localhost:4200', process.env.VERCEL_URL]
        const allowed = allowedHosts.includes(new URL(redirectUrl).host)
        if (allowed) {
          return redirectUrl
        }
      }
      return '/'
    }
  })
}
