import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import {
  Auth,
  UserCredential,
  signOut as firebaseSignOut,
  getAuth
} from 'firebase/auth'

import { clientConfig } from './config'

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp()
  return initializeApp(clientConfig)
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp())
}

export async function login(token: string): Promise<void> {
  await fetch('/api/login', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  })
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
    const auth = getAuth()
    await firebaseSignOut(auth)
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
