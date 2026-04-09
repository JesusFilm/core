import { UserCredential } from 'firebase/auth'

import { getFirebaseAuth } from '../../libs/auth/firebase'

export async function login(token: string): Promise<void> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`
  }

  await fetch('/api/login', {
    method: 'GET',
    headers
  })
}

export async function loginWithCredential(
  credential: UserCredential
): Promise<void> {
  const idToken = await credential.user.getIdToken()

  await login(idToken)
}

export async function logout(): Promise<void> {
  const headers: Record<string, string> = {}

  await fetch('/api/logout', {
    method: 'GET',
    headers
  })
}

export async function checkEmailVerification(): Promise<void> {
  const headers: Record<string, string> = {}

  await fetch('/api/check-email-verification', {
    method: 'GET',
    headers
  })
}

export async function refreshToken(): Promise<string | null> {
  const currentUser = getFirebaseAuth().currentUser

  if (currentUser != null) {
    const idToken = await currentUser.getIdToken(true)
    await login(idToken)
    return idToken
  }

  // Fallback for cases where the browser Firebase user is unavailable.
  await fetch('/api/refresh-token', {
    method: 'GET',
    headers: {},
    cache: 'no-store'
  })

  return null
}
