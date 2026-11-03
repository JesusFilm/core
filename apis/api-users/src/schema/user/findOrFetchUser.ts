import { GraphQLError } from 'graphql'

import { Prisma, User, prisma } from '@core/prisma/users/client'
import {
  type UserRecord,
  auth,
  sanitizeDisplayName,
  sanitizePhotoURL,
  splitDisplayName
} from '@core/yoga/firebaseClient'

import { logger } from '../logger'

import { type AppType } from './enums/app'
import { verifyUser } from './verifyUser'

const ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED = 'P2002'
const ERROR_PSQL_RECORD_NOT_FOUND = 'P2025'

// Thrown when a sign-in's email already belongs to a User row keyed to a
// different Firebase UID and Firebase has not verified that email, so the
// row cannot safely be re-linked to the new UID. Re-linking on an unverified
// email would hand an existing account to whoever registered the address.
//
// The message intentionally doesn't tell the user to "verify the email" —
// no frontend flow does that yet for this error. Callers should key off
// extensions.code, not this text.
export class UserEmailConflictError extends GraphQLError {
  constructor() {
    super('This email is already linked to another account.', {
      extensions: { code: 'USER_EMAIL_CONFLICT' }
    })
    this.name = 'UserEmailConflictError'
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED
  )
}

function isRecordNotFoundError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === ERROR_PSQL_RECORD_NOT_FOUND
  )
}

// Moves the row holding this email onto the new Firebase UID. Only `userId`
// changes, so the row keeps its id and the rest of its fields (createdAt,
// profile). The `userId` and `email` guards on the update make a concurrent
// change to the row (another relink, or the holder's own email changing)
// fail the write instead of being overwritten.
async function relinkUserToFirebaseUid(
  email: string,
  userId: string
): Promise<User> {
  return await prisma.$transaction(async (tx) => {
    const holder = await tx.user.findUnique({ where: { email } })
    if (holder == null) {
      // Another concurrent call may have already relinked this exact
      // mixed-case email and normalized the row's email to lowercase as
      // part of that write, so this lookup by the original string no
      // longer matches anything. Check by userId before giving up, same
      // recovery as the update-conflict branch below.
      const relinkedByOtherCall = await tx.user.findUnique({
        where: { userId }
      })
      if (relinkedByOtherCall != null) return relinkedByOtherCall
      throw new Error('User row holding the email disappeared during re-link')
    }
    if (holder.userId === userId) return holder
    // A superAdmin row's email can be orphaned (e.g. the admin moved on and
    // the address was reassigned), so an unrelated person later verifying it
    // must not inherit the privilege. Surface the same conflict as an
    // unverified email instead of relinking.
    if (holder.superAdmin) throw new UserEmailConflictError()

    try {
      const relinked = await tx.user.update({
        where: { id: holder.id, userId: holder.userId, email },
        data: { userId, emailVerified: true, email: email.trim().toLowerCase() }
      })
      logger.warn(
        { userRowId: holder.id, previousUserId: holder.userId, userId },
        'findOrFetchUser: re-linked User on verified email'
      )
      return relinked
    } catch (error) {
      if (!isRecordNotFoundError(error)) throw error
      // Another concurrent call relinked this row between our read above
      // and this update, so the userId guard lost the race safely.
      const relinkedByOtherCall = await tx.user.findUnique({
        where: { userId }
      })
      if (relinkedByOtherCall == null) throw error
      return relinkedByOtherCall
    }
  })
}

// The create lost to a unique constraint. Either a concurrent call already
// created the row for this UID, or the email belongs to a row keyed to a
// different (stale) Firebase UID, e.g. an account re-created in Firebase.
async function resolveCreateConflict(
  error: unknown,
  userId: string,
  email: string | null,
  emailVerified: boolean
): Promise<User> {
  const racedUser = await prisma.user.findUnique({ where: { userId } })
  if (racedUser != null) {
    // The concurrent call that created this row may have read Firebase
    // before the email was verified or settled on an older email; sync both
    // now, since once emailVerified is true the existing-user sync path
    // (which re-reads Firebase) no longer runs for this row.
    if (!racedUser.emailVerified && emailVerified)
      return await prisma.user.update({
        where: { userId },
        data: { emailVerified: true, ...(email != null && { email }) }
      })
    return racedUser
  }

  if (email == null) throw error
  const emailHolder = await prisma.user.findUnique({ where: { email } })
  if (emailHolder == null) throw error

  if (!emailVerified) throw new UserEmailConflictError()
  return await relinkUserToFirebaseUid(email, userId)
}

// linkWithPopup on an anonymous user does not promote the provider's
// displayName/photoURL onto the top-level Firebase user record, so
// auth.getUser() returns null for those fields even when the provider data is
// populated. Fall back to any linked (non-firebase) provider so conversions
// pick up the profile. Values are sanitized to defend against hostile IdPs.
function resolveProviderProfile(firebaseUser: UserRecord): {
  displayName: string | null
  photoURL: string | null
} {
  const linked = firebaseUser.providerData?.find(
    (p) => p.providerId !== 'firebase'
  )
  return {
    displayName: sanitizeDisplayName(
      firebaseUser.displayName ?? linked?.displayName
    ),
    photoURL: sanitizePhotoURL(firebaseUser.photoURL ?? linked?.photoURL)
  }
}

export async function findOrFetchUser(
  query: { select?: Prisma.UserSelect; include?: undefined },
  userId: string,
  redirect: string | undefined = undefined,
  app?: AppType | undefined
): Promise<User | null> {
  const existingUser = await prisma.user.findUnique({
    ...query,
    where: {
      userId
    }
  })
  if (existingUser != null && existingUser.emailVerified == null) {
    const user = await prisma.user.update({
      where: {
        userId
      },
      data: {
        emailVerified: false
      }
    })
    return user
  }

  if (existingUser != null && existingUser.emailVerified != null) {
    if (existingUser.emailVerified === false) {
      const firebaseUser = await auth.getUser(userId)
      if (firebaseUser.emailVerified) {
        const { displayName, photoURL } = resolveProviderProfile(firebaseUser)
        const split = splitDisplayName(displayName)
        return await prisma.user.update({
          where: { userId },
          data: {
            emailVerified: true,
            ...(split != null && {
              firstName: split.firstName,
              lastName: split.lastName
            }),
            ...(firebaseUser.email != null && {
              email: firebaseUser.email.trim().toLowerCase()
            }),
            ...(photoURL != null && { imageUrl: photoURL })
          }
        })
      }
    }
    return existingUser
  }

  const firebaseUser = await auth.getUser(userId)
  const { email, emailVerified } = firebaseUser
  const { displayName, photoURL: imageUrl } =
    resolveProviderProfile(firebaseUser)
  const split = splitDisplayName(displayName)

  const data = {
    userId,
    firstName: split?.firstName ?? 'Unknown User',
    lastName: split?.lastName ?? '',
    email: email != null ? email.trim().toLowerCase() : null,
    imageUrl,
    emailVerified
  }

  // The unique index on email is case-sensitive, so a legacy row stored with
  // mixed case (predating the lowercasing above) would not collide with this
  // create and a duplicate row would be created instead of relinking. Check
  // case-insensitively first so legacy rows still relink.
  //
  // Prisma's `mode: 'insensitive'` on Postgres compiles to ILIKE, which
  // treats `%` and `_` as wildcards, so an unescaped email containing either
  // (a valid RFC-5322 local-part character) could match an unrelated row
  // and relink it onto this verified-but-wrong account.
  if (data.email != null) {
    const escapedEmail = data.email.replace(/[\\%_]/g, '\\$&')
    const caseInsensitiveHolder = await prisma.user.findFirst({
      where: { email: { equals: escapedEmail, mode: 'insensitive' } }
    })
    const holderEmail = caseInsensitiveHolder?.email
    if (holderEmail != null) {
      if (!emailVerified) throw new UserEmailConflictError()
      return await relinkUserToFirebaseUid(holderEmail, userId)
    }
  }

  let user: User
  // this function can run in parallel, so another call may create the row
  // between the lookup above and this create (the Firebase call widens the
  // window); resolveCreateConflict covers that and stale-UID email collisions.
  try {
    user = await prisma.user.create({ data })
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error
    return await resolveCreateConflict(error, userId, data.email, emailVerified)
  }
  // after user create so it is only sent once
  if (email != null && !emailVerified)
    await verifyUser(userId, email, redirect, app)
  return user
}
