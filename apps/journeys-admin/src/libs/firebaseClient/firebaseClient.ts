import { initializeApp } from '@firebase/app'

export const firebaseClient = initializeApp(
  JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG_JSON ?? '{}')
)
