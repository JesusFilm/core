import { getApp, getApps, initializeApp } from 'firebase/app'

import { env } from '../env'

export function getFirebaseClient() {
  if (getApps().length > 0) return getApp()

  const firebaseConfig = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    appId: env.FIREBASE_APP_ID
  }

  return initializeApp(firebaseConfig)
}
