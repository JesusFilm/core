const normalizePrivateKey = (key: string | undefined): string =>
  key?.replace(/\\n/g, '\n') ?? ''

const getCookieKeys = (): string[] => {
  const current = process.env.AUTH_SECRET ?? 'watch-modern-dev-secret'
  const previous = process.env.AUTH_SECRET_PREVIOUS

  return previous != null && previous.length > 0 ? [current, previous] : [current]
}

export const authCookieName = 'watch-modern'

export const firebaseAdminConfig = {
  credential: {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    clientEmail:
      process.env.FIREBASE_CLIENT_EMAIL ??
      process.env.PRIVATE_FIREBASE_CLIENT_EMAIL ??
      '',
    privateKey: normalizePrivateKey(
      process.env.FIREBASE_PRIVATE_KEY ?? process.env.PRIVATE_FIREBASE_PRIVATE_KEY
    )
  }
}

export const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? ''
}

export const authCookiesConfig = {
  name: authCookieName,
  keys: getCookieKeys(),
  httpOnly: true,
  maxAge: 5 * 24 * 60 * 60 * 1000,
  overwrite: true,
  path: '/',
  sameSite: 'lax' as const,
  secure:
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'prod' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'stage' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',
  signed: true
}
