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

  // Comment 6: skip UID lookup when userId is empty — an empty string triggers
  // auth/invalid-uid in Firebase which is NOT a not-found error and would
  // previously be swallowed (treated as absent). This path is hit when we call
  // checkFirebaseUser('', email) for a firebase-only email lookup.
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
        // Comment 6: rethrow unexpected errors — only user-not-found should
        // continue to the email fallback; transient failures (network, auth
        // permissions) should not be silently treated as "user absent".
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
        // Comment 6: same as above — rethrow unexpected errors
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

export async function lookupUser(
  idType: 'databaseId' | 'email',
  id: string
): Promise<LookupResult> {
  const logs: LogEntry[] = []
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

  // Comment 7: log identifying details server-side only; do not expose the
  // raw id value in the client-facing error message.
  console.error(`User not found with ${idType}:`, id)
  throw new GraphQLError('User not found', {
    extensions: { code: 'NOT_FOUND' }
  })
}
