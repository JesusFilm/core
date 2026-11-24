import { env } from '../../env'

/**
 * Server-side auth settings for next-firebase-auth-edge. A function, not a
 * constant: it reads server-only values, which must not be touched when this
 * module is bundled for the client (`clientConfig` below is).
 */
export function authConfig() {
  return {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    cookieName: 'AuthToken',
    cookieSignatureKeys: [env.AUTH_SECRET],
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    serviceAccount: {
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY
    }
  }
}

export const clientConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID
}
