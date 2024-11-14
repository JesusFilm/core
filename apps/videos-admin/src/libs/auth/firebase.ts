import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import {
  Auth,
  GoogleAuthProvider,
  UserCredential,
  browserPopupRedirectResolver,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInWithPopup,
  useDeviceLanguage
} from 'firebase/auth'

import { clientConfig } from './config'

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp()

  return initializeApp(clientConfig)
}

export function getFirebaseAuth(): Auth {
  const auth = getAuth(getFirebaseApp())

  // App relies only on server token. We make sure Firebase does not store
  // credentials in the browser.
  // See: https://github.com/awinogrodzki/next-firebase-auth-edge/issues/143
  void setPersistence(auth, inMemoryPersistence)

  return auth
}

function getGoogleProvider(auth: Auth): GoogleAuthProvider {
  const provider = new GoogleAuthProvider()
  provider.addScope('profile')
  provider.addScope('email')
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useDeviceLanguage(auth)
  provider.setCustomParameters({
    display: 'popup'
  })

  return provider
}

export async function loginWithGoogle(auth: Auth): Promise<UserCredential> {
  return await signInWithPopup(
    auth,
    getGoogleProvider(auth),
    browserPopupRedirectResolver
  )
}
