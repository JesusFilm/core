import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import {
  Auth,
  GoogleAuthProvider,
  UserCredential,
  browserPopupRedirectResolver,
  inMemoryPersistence,
  initializeAuth,
  signInWithPopup,
  useDeviceLanguage
} from 'firebase/auth'

import { clientConfig } from './config'

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp()

  return initializeApp(clientConfig)
}

let auth: Auth | undefined

export function getFirebaseAuth(): Auth {
  if (auth != null) return auth

  // App relies only on server token. We make sure Firebase does not store
  // credentials in the browser.
  // See: https://github.com/awinogrodzki/next-firebase-auth-edge/issues/143
  //
  // initializeAuth instead of getAuth() + setPersistence: getAuth() still
  // instantiates its IndexedDB persistence, whose visibilitychange handler in
  // @firebase/auth 1.13.4 closes the database while the sign-in popup has
  // focus and fails sign-in with "Database is closing/hidden".
  // See: https://github.com/firebase/firebase-js-sdk/issues/10264
  // On the server browserPopupRedirectResolver is a non-class stub and
  // initializeAuth rejects it ("Expected a class definition").
  auth = initializeAuth(getFirebaseApp(), {
    persistence: inMemoryPersistence,
    ...(typeof window === 'undefined'
      ? {}
      : { popupRedirectResolver: browserPopupRedirectResolver })
  })
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
