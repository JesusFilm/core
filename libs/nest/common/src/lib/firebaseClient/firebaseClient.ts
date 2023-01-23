import { initializeApp, credential } from 'firebase-admin'

export const firebaseClient = initializeApp(
  process.env.GOOGLE_APPLICATION_JSON != null &&
    process.env.GOOGLE_APPLICATION_JSON !== ''
    ? {
        credential: credential.cert(
          JSON.parse(process.env.GOOGLE_APPLICATION_JSON)
        )
      }
    : undefined
)
