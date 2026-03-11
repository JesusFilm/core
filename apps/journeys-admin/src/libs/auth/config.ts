export const authConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  cookieName: 'journeys-admin',
  cookieSignatureKeys: [
    process.env.COOKIE_SECRET_CURRENT as string,
    process.env.COOKIE_SECRET_PREVIOUS as string
  ],
  serviceAccount: {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
    clientEmail: process.env.PRIVATE_FIREBASE_CLIENT_EMAIL as string,
    privateKey: process.env.PRIVATE_FIREBASE_PRIVATE_KEY as string
  }
}

export const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string
}
