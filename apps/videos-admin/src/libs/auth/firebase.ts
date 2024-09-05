import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import {
  Auth,
  AuthError,
  AuthProvider,
  GoogleAuthProvider,
  UserCredential,
  browserPopupRedirectResolver,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  useDeviceLanguage
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

const CREDENTIAL_ALREADY_IN_USE_ERROR = 'auth/credential-already-in-use'
export const isCredentialAlreadyInUseError = (e: AuthError): boolean =>
  e?.code === CREDENTIAL_ALREADY_IN_USE_ERROR

export const logout = async (auth: Auth): Promise<void> => {
  return await signOut(auth)
}

export const getGoogleProvider = (auth: Auth): GoogleAuthProvider => {
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

export const loginWithProvider = async (
  auth: Auth,
  provider: AuthProvider
): Promise<UserCredential> => {
  const result = await signInWithPopup(
    auth,
    provider,
    browserPopupRedirectResolver
  )

  return result
}

export const loginWithProviderUsingRedirect = async (
  auth: Auth,
  provider: AuthProvider
): Promise<void> => {
  await signInWithRedirect(auth, provider)
}
