import { getApp, getApps, initializeApp } from 'firebase/app'
import 'dotenv/config'

function requireEnvVar(name: string): string {
  const value = process.env[name]
  if (value) return value
  throw new Error(`Missing required environment variable: ${name}`)
}

export function getFirebaseClient() {
  if (getApps().length > 0) return getApp()

  const firebaseConfig = {
    apiKey: requireEnvVar('FIREBASE_API_KEY'),
    authDomain: requireEnvVar('FIREBASE_AUTH_DOMAIN'),
    projectId: requireEnvVar('FIREBASE_PROJECT_ID'),
    appId: requireEnvVar('FIREBASE_APP_ID')
  }

  return initializeApp(firebaseConfig)
}
