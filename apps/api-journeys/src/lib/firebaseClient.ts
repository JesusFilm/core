import { initializeApp, cert } from 'firebase-admin/app'

export const firebaseClient = initializeApp({
  credential: cert(JSON.parse(process.env.GOOGLE_APPLICATION_JSON ?? '{}'))
})
