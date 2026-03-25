import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  Auth,
  browserLocalPersistence,
  getAuth,
  initializeAuth
} from 'firebase/auth'

export const firebaseClient =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      })

/**
 * On the client, explicitly use localStorage persistence instead of the
 * default IndexedDB. IndexedDB is unreliable across page loads in some
 * environments, causing Firebase to lose the anonymous user and mint a new
 * UID on every navigation — which creates duplicate Visitor records.
 */
function createAuth(): Auth {
  if (typeof window === 'undefined') return getAuth(firebaseClient)
  try {
    return initializeAuth(firebaseClient, {
      persistence: browserLocalPersistence
    })
  } catch {
    return getAuth(firebaseClient)
  }
}

export const firebaseAuth = createAuth()
