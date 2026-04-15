import { GraphQLError } from 'graphql'

import { User, prisma } from '@core/prisma/users/client'
import { auth } from '@core/yoga/firebaseClient'

import { LogEntry, createLog, isFirebaseNotFound } from './types'

interface FirebaseStatus {
  exists: boolean
  uid: string | null
  email: string | null
  disabled: boolean
  providerIds: string[]
}

interface LookupResult {
  user: User | null
  firebase: FirebaseStatus
  logs: LogEntry[]
}

async function checkFirebaseUser(
  userId: string,
  email: string | null
): Promise<{ status: FirebaseStatus; logs: LogEntry[] }> {
  const logs: LogEntry[] = []

  // Skip UID lookup when userId is empty — an empty string triggers
  // auth/invalid-uid in Firebase which is NOT a not-found error and must not
  // be swallowed. This path is hit when calling checkFirebaseUser('', email)
  // for a firebase-only email lookup.
  if (userId !== '') {
    try {
      const fbUser = await auth.getUser(userId)
      const providerIds = fbUser.providerData.map((p) => p.providerId)
      logs.push(
        createLog(
          `🔥 Firebase user found by UID: ${fbUser.email ?? 'no email'} (providers: ${providerIds.join(', ') || 'none'}, disabled: ${fbUser.disabled})`
        )
      )
      return {
        status: {
          exists: true,
          uid: fbUser.uid,
          email: fbUser.email ?? null,
          disabled: fbUser.disabled,
          providerIds
        },
        logs
      }
    } catch (error) {
      if (!isFirebaseNotFound(error)) {
        // Only user-not-found should fall through to the email fallback;
        // transient failures (network, auth permissions) must not be silently
        // treated as "user absent".
        throw error
      }
    }
  }

  // UID not found or skipped — try by email as fallback
  if (email != null) {
    try {
      const fbUser = await auth.getUserByEmail(email)
      const providerIds = fbUser.providerData.map((p) => p.providerId)
      logs.push(
        createLog(
          `⚠️ Firebase user NOT found by UID (${userId}) but FOUND by email (${email}). Firebase UID: ${fbUser.uid} (providers: ${providerIds.join(', ') || 'none'}, disabled: ${fbUser.disabled})`,
          'warn'
        )
      )
      return {
        status: {
          exists: true,
          uid: fbUser.uid,
          email: fbUser.email ?? null,
          disabled: fbUser.disabled,
          providerIds
        },
        logs
      }
    } catch (error) {
      if (!isFirebaseNotFound(error)) {
        throw error
      }
    }
  }

  logs.push(createLog('🔥 No Firebase auth record found'))
  return {
    status: {
      exists: false,
      uid: null,
      email: null,
      disabled: false,
      providerIds: []
    },
    logs
  }
}

const MAX_ID_LENGTH = 2048
// Basic email format: local@domain.tld
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Standard UUID v4 format
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function lookupUser(
  idType: 'databaseId' | 'email' | 'jwt',
  id: string
): Promise<LookupResult> {
  if (id.length > MAX_ID_LENGTH) {
    throw new GraphQLError('id exceeds maximum allowed length', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  }
  if (idType === 'email' && !EMAIL_REGEX.test(id)) {
    throw new GraphQLError(
      'id must be a valid email address when idType is "email"',
      { extensions: { code: 'BAD_USER_INPUT' } }
    )
  }
  if (idType === 'databaseId' && !UUID_REGEX.test(id)) {
    throw new GraphQLError(
      'id must be a valid UUID when idType is "databaseId"',
      { extensions: { code: 'BAD_USER_INPUT' } }
    )
  }

  const logs: LogEntry[] = []

  if (idType === 'jwt') {
    logs.push(createLog('🔍 Looking for user by JWT token'))

    let uid: string
    try {
      const decodedToken = await auth.verifyIdToken(id)
      uid = decodedToken.uid
      logs.push(createLog(`✅ JWT verified, Firebase UID: ${uid}`))
    } catch (error) {
      console.error('Failed to verify JWT token:', error)
      throw new GraphQLError('Invalid or expired JWT token', {
        extensions: { code: 'UNAUTHENTICATED' }
      })
    }

    const user = await prisma.user.findUnique({ where: { userId: uid } })

    if (user != null) {
      logs.push(
        createLog(
          `✅ User found: ${user.firstName} ${user.lastName ?? ''} (${user.email ?? 'no email'})`
        )
      )
      const { status: firebase, logs: fbLogs } = await checkFirebaseUser(
        user.userId,
        user.email
      )
      logs.push(...fbLogs)
      return { user, firebase, logs }
    }

    // No DB user — check Firebase directly by UID
    logs.push(
      createLog(`⚠️ No database user found for Firebase UID: ${uid}`, 'warn')
    )
    const { status: firebase, logs: fbLogs } = await checkFirebaseUser(
      uid,
      null
    )
    logs.push(...fbLogs)

    if (firebase.exists) {
      logs.push(
        createLog(
          '⚠️ Firebase-only account detected — no database record, but Firebase auth exists',
          'warn'
        )
      )
      return { user: null, firebase, logs }
    }

    console.error('User not found with JWT UID:', uid)
    throw new GraphQLError('User not found', {
      extensions: { code: 'NOT_FOUND' }
    })
  }

  logs.push(createLog(`🔍 Looking for user by ${idType}: ${id}`))

  const user =
    idType === 'email'
      ? await prisma.user.findUnique({ where: { email: id } })
      : await prisma.user.findUnique({ where: { id } })

  if (user != null) {
    logs.push(
      createLog(
        `✅ User found: ${user.firstName} ${user.lastName ?? ''} (${user.email ?? 'no email'})`
      )
    )

    const { status: firebase, logs: fbLogs } = await checkFirebaseUser(
      user.userId,
      user.email
    )
    logs.push(...fbLogs)

    return { user, firebase, logs }
  }

  // No DB user — check Firebase directly (only possible with email lookup)
  logs.push(createLog(`⚠️ No database user found for ${idType}: ${id}`, 'warn'))

  if (idType === 'email') {
    const { status: firebase, logs: fbLogs } = await checkFirebaseUser('', id)
    logs.push(...fbLogs)

    if (firebase.exists) {
      logs.push(
        createLog(
          '⚠️ Firebase-only account detected — no database record, but Firebase auth exists',
          'warn'
        )
      )
      return { user: null, firebase, logs }
    }
  }

  // Log identifying details server-side only; do not expose the raw id value
  // in the client-facing error message.
  console.error(`User not found with ${idType}:`, id)
  throw new GraphQLError('User not found', {
    extensions: { code: 'NOT_FOUND' }
  })
}
