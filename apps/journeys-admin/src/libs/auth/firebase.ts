import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import {
  Auth,
  UserCredential,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  signOut as firebaseSignOut,
  inMemoryPersistence,
  initializeAuth
} from 'firebase/auth'

import { clientConfig } from './config'

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp()
  return initializeApp(clientConfig)
}

let auth: Auth | undefined

export function getFirebaseAuth(): Auth {
  if (auth != null) return auth
  // localStorage persistence instead of getAuth()'s IndexedDB default:
  // @firebase/auth 1.13.4 closes its IndexedDB connection whenever the
  // document is hidden — which the sign-in popup itself triggers — so
  // persisting the signed-in user throws "Database is closing/hidden" and
  // sign-in fails. https://github.com/firebase/firebase-js-sdk/issues/10264
  //
  // On the server the browser persistence/resolver exports are non-class
  // stubs and initializeAuth rejects them ("Expected a class definition"),
  // so pass server-safe options there.
  auth =
    typeof window === 'undefined'
      ? initializeAuth(getFirebaseApp(), { persistence: inMemoryPersistence })
      : initializeAuth(getFirebaseApp(), {
          persistence: browserLocalPersistence,
          popupRedirectResolver: browserPopupRedirectResolver
        })
  return auth
}

export async function login(token: string): Promise<void> {
  const response = await fetch('/api/login', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  })
  // A non-ok response means the session cookie was never minted. Without this
  // check the caller reloads onto a page it is not authenticated for, which
  // presents to the user as an endless sign-in loop instead of an error.
  if (!response.ok)
    throw new Error(`/api/login responded with status ${response.status}`)
}

export async function loginWithCredential(
  credential: UserCredential
): Promise<void> {
  const idToken = await credential.user.getIdToken()
  await login(idToken)
  window.location.reload()
}

export async function logout(): Promise<void> {
  try {
    await firebaseSignOut(getFirebaseAuth())
  } catch {
    // Firebase may not be initialized
  }
  try {
    await fetch('/api/logout', { method: 'GET' })
  } catch {
    // Redirect regardless of network errors
  }
  window.location.href = '/users/sign-in'
}
