import { GraphQLError } from 'graphql'

import { User, prisma } from '@core/prisma/users/client'
import { auth } from '@core/yoga/firebaseClient'

import { LogEntry, createLog } from './types'

interface FirebaseStatus {
  exists: boolean
  uid: string | null
  email: string | null
  disabled: boolean
  providerIds: string[]
}

interface LookupResult {
  user: User
  firebase: FirebaseStatus
  logs: LogEntry[]
}

async function checkFirebaseUser(
  userId: string,
  email: string | null
): Promise<{ status: FirebaseStatus; logs: LogEntry[] }> {
  const logs: LogEntry[] = []

  // Try by UID first
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
    const isNotFound =
      error != null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'auth/user-not-found'

    if (!isNotFound) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      logs.push(
        createLog(
          `⚠️ Firebase lookup by UID failed: ${message}`,
          'warn'
        )
      )
    }
  }

  // UID not found — try by email as fallback
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
      const isNotFound =
        error != null &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'auth/user-not-found'

      if (!isNotFound) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        logs.push(
          createLog(
            `⚠️ Firebase lookup by email also failed: ${message}`,
            'warn'
          )
        )
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

  if (user == null) {
    throw new GraphQLError(`User not found with ${idType}: ${id}`, {
      extensions: { code: 'NOT_FOUND' }
    })
  }

  logs.push(
    createLog(
      `✅ User found: ${user.firstName} ${user.lastName ?? ''} (${user.email ?? 'no email'})`
    )
  )

  // Check Firebase status
  const { status: firebase, logs: fbLogs } = await checkFirebaseUser(
    user.userId,
    user.email
  )
  logs.push(...fbLogs)

  return { user, firebase, logs }
}
