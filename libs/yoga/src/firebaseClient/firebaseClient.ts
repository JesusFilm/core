import { ServiceAccount, cert, initializeApp } from 'firebase-admin/app'
import { type UserRecord, getAuth } from 'firebase-admin/auth'
import { Logger } from 'pino'
import { z } from 'zod'

export type { UserRecord }

export interface User {
  id: string
  firstName: string
  lastName?: string
  email?: string | null
  imageUrl?: string | null
  emailVerified: boolean
}

const DISPLAY_NAME_MAX_LENGTH = 100
const PHOTO_URL_MAX_LENGTH = 2048

// Strips control characters (category C in Unicode) that hostile IdPs can use
// for homoglyph/RTL-override impersonation, trims whitespace, and caps length.
export function sanitizeDisplayName(
  raw: string | null | undefined
): string | null {
  if (raw == null) return null
  const cleaned = raw.replace(/\p{C}/gu, '').trim()
  if (cleaned === '') return null
  return cleaned.slice(0, DISPLAY_NAME_MAX_LENGTH)
}

// Only accepts https URLs and caps length. Anything else becomes null so the
// DB never persists an attacker-controlled data:/http: URL.
export function sanitizePhotoURL(
  raw: string | null | undefined
): string | null {
  if (raw == null) return null
  if (raw.length > PHOTO_URL_MAX_LENGTH) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:') return null
    return raw
  } catch {
    return null
  }
}

// Splits a displayName into {firstName, lastName}. Returns null if the input
// has no usable content — callers that need a non-null firstName (e.g. DB
// create paths constrained by NOT NULL) fall back to 'Unknown User' themselves,
// while update paths leave the existing value alone.
export function splitDisplayName(raw: string | null | undefined): {
  firstName: string
  lastName: string
} | null {
  const cleaned = sanitizeDisplayName(raw)
  if (cleaned == null) return null
  const parts = cleaned.split(' ').filter((p) => p.length > 0)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1]
  }
}

export const firebaseClient = initializeApp(
  process.env.GOOGLE_APPLICATION_JSON != null &&
    process.env.GOOGLE_APPLICATION_JSON !== ''
    ? {
        credential: cert(
          JSON.parse(process.env.GOOGLE_APPLICATION_JSON) as ServiceAccount
        )
      }
    : undefined,
  'jfm-firebase-admin'
)

const payloadSchema = z
  .object({
    name: z.string().nullish(),
    picture: z.string().nullish(),
    user_id: z.string(),
    email: z.string().nullish(),
    email_verified: z.boolean().nullish()
  })
  .transform((data) => {
    const split = splitDisplayName(data.name)
    return {
      id: data.user_id,
      firstName: split?.firstName ?? 'Unknown User',
      lastName: split?.lastName ?? '',
      email: data.email,
      imageUrl: sanitizePhotoURL(data.picture),
      emailVerified: data.email_verified ?? false
    }
  })

export const auth = getAuth(firebaseClient)

export function getUserIdFromPayload(
  payload: unknown,
  logger?: Logger
): string | null {
  if (process.env.NODE_ENV === 'test') return 'testUserId'

  const result = payloadSchema.safeParse(payload)
  if (result.success) return result.data.id

  if (payload != null)
    logger?.error(result.error, 'getUserIdFromPayload failed to parse')

  return null
}

export function getUserFromPayload(
  payload: unknown,
  logger?: Logger
): User | null {
  if (process.env.NODE_ENV === 'test')
    return {
      id: 'testUserId',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      emailVerified: true,
      imageUrl: null
    }

  const result = payloadSchema.safeParse(payload)
  if (result.success) return result.data

  if (payload != null)
    logger?.error(result.error, 'getUserFromPayload failed to parse')

  return null
}

export async function impersonateUser(userId: string): Promise<string> {
  return await auth.createCustomToken(userId)
}
