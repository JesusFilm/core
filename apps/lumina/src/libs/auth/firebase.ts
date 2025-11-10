import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import {
  Auth,
  FacebookAuthProvider,
  GoogleAuthProvider,
  UserCredential,
  browserPopupRedirectResolver,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInWithPopup,
  useDeviceLanguage
} from 'firebase/auth'

import { clientConfig } from './client-config'

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp()

  return initializeApp(clientConfig)
}

export function getFirebaseAuth(): Auth {
  const auth = getAuth(getFirebaseApp())

  void setPersistence(auth, inMemoryPersistence)

  return auth
}

function getGoogleProvider(auth: Auth): GoogleAuthProvider {
  const provider = new GoogleAuthProvider()
  provider.addScope('profile')
  provider.addScope('email')
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

function getFacebookProvider(auth: Auth): FacebookAuthProvider {
  const provider = new FacebookAuthProvider()
  provider.addScope('email')
  useDeviceLanguage(auth)
  provider.setCustomParameters({
    display: 'popup'
  })

  return provider
}

export async function loginWithFacebook(auth: Auth): Promise<UserCredential> {
  return await signInWithPopup(
    auth,
    getFacebookProvider(auth),
    browserPopupRedirectResolver
  )
}

