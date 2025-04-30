import { getApp, getApps, initializeApp } from 'firebase/app'
import 'dotenv/config'

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

export const firebaseClient =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
