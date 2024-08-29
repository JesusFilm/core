import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import {
  Auth,
  getAuth,
  inMemoryPersistence,
  setPersistence
} from 'firebase/auth'

import { clientConfig } from './config'

export const getFirebaseApp = (): FirebaseApp => {
  if (getApps().length > 0) {
    return getApp()
  }

  return initializeApp(clientConfig)
}

export function getFirebaseAuth(): Auth {
  const auth = getAuth(getFirebaseApp())

  // App relies only on server token. We make sure Firebase does not store credentials in the browser.
  // See: https://github.com/awinogrodzki/next-firebase-auth-edge/issues/143
  void setPersistence(auth, inMemoryPersistence)

  return auth
}
