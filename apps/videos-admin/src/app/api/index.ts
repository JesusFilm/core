import { UserCredential } from 'firebase/auth'

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

export async function refreshToken(): Promise<void> {
  const headers: Record<string, string> = {}

  // Intentionally a simple GET to let edge middleware refresh tokens/cookies
  await fetch('/api/refresh-token', {
    method: 'GET',
    headers,
    // Avoid caching; ensure request hits the edge/middleware
    cache: 'no-store'
  })
}
