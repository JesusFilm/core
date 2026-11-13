import { UserCredential } from 'firebase/auth'

import { getFirebaseAuth } from '../../libs/auth/firebase'

export async function login(token: string): Promise<void> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`
  }

  const response = await fetch('/api/login', {
    method: 'GET',
    headers
  })

  // /api/login is where the session cookie is set. Without it every page
  // request bounces back to sign-in, so a failure here must reach the user.
  if (!response.ok) throw new Error('Login Failed')
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
    // Callers only need the fresh ID token; a failed cookie sync must not
    // fail them (e.g. an in-flight video upload).
    await login(idToken).catch((error: unknown) => {
      console.warn('Failed to refresh session cookie', { error })
    })
    return idToken
  }

  // Fallback for cases where the browser Firebase user is unavailable.
  const refreshResponse = await fetch('/api/refresh-token', {
    method: 'GET',
    headers: {},
    cache: 'no-store',
    credentials: 'same-origin'
  })

  if (!refreshResponse.ok) return null

  try {
    const { idToken } = (await refreshResponse.json()) as { idToken?: unknown }

    return typeof idToken === 'string' ? idToken : null
  } catch {
    return null
  }
}
