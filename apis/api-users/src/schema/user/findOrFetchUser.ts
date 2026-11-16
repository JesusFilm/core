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
import { isEmailHeldByAnotherUser } from './findUserByEmail'
import { isFirebaseNotFound } from './isFirebaseNotFound'
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

// A row may only be moved off a Firebase UID that no longer exists. If the
// old account is still live (two Firebase accounts sharing one verified
// email, or an email moved between providers) relinking would flip the row
// back and forth between them, and any read that resolves a user reference
// could trigger it. Only `auth/user-not-found` counts as stale; any other
// failure (network, permissions) is rethrown rather than guessed at.
async function assertPreviousUidIsStale(previousUserId: string): Promise<void> {
  try {
    await auth.getUser(previousUserId)
  } catch (error) {
    if (isFirebaseNotFound(error)) return
    throw error
  }
  throw new UserEmailConflictError()
}

// Moves the row holding this email onto the new Firebase UID. Only `userId`
// changes, so the row keeps its id and the rest of its fields (createdAt,
// profile). The `userId` and `email` guards on the update make a concurrent
// change to the row (another relink, or the holder's own email changing)
// fail the write instead of being overwritten.
//
// Only the api-users row moves. Rows in other databases (api-journeys:
// UserJourney, UserTeam, UserRole, JourneyProfile; api-media: UserMediaRole,
// UserMediaProfile) stay keyed to the old UID, so the user gets their profile
// back but not their journeys, teams or roles.
//
// No step here runs inside a `prisma.$transaction`: the update's own WHERE
// guard (id + userId + email + superAdmin) is what makes the write safe under
// a concurrent relink or email change, not transactional isolation (Postgres'
// default Read Committed gives each statement its own snapshot regardless).
// A wrapping transaction would only hold a pooled connection open across the
// `assertPreviousUidIsStale` network round-trip below without adding any
// correctness, and could abort on Prisma's interactive-transaction timeout if
// Firebase is slow.
async function relinkUserToFirebaseUid(
  email: string,
  userId: string
): Promise<User> {
  const holder = await prisma.user.findUnique({ where: { email } })
  if (holder == null) {
    // Another concurrent call may have already relinked this exact
    // mixed-case email and normalized the row's email to lowercase as
    // part of that write, so this lookup by the original string no
    // longer matches anything. Check by userId before giving up, same
    // recovery as the update-conflict branch below.
    const relinkedByOtherCall = await prisma.user.findUnique({
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

  const normalizedEmail = email.trim().toLowerCase()
  // The unique index on email is case-sensitive, so other rows that match
  // this address only by case -- an already-lowercase row, or another legacy
  // row in a different mixed case -- can coexist with this holder. Check for
  // them case-insensitively and always, including when the holder's email is
  // already normalized: the holder is just whichever of the duplicates the
  // lookup returned first, so skipping the check would let a relink silently
  // abandon a second account for the same address.
  if (await isEmailHeldByAnotherUser(normalizedEmail, holder.userId))
    throw new UserEmailConflictError()

  await assertPreviousUidIsStale(holder.userId)

  try {
    const relinked = await prisma.user.update({
      where: {
        id: holder.id,
        userId: holder.userId,
        email,
        superAdmin: false
      },
      data: { userId, emailVerified: true, email: normalizedEmail }
    })
    logger.warn(
      { userRowId: holder.id, previousUserId: holder.userId, userId },
      'findOrFetchUser: re-linked User on verified email'
    )
    return relinked
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      // The write hit a unique column another row already holds. Either a
      // concurrent call took this userId (relinked or created its row), or a
      // row took the normalized email after the collision check above.
      const rowForUserId = await prisma.user.findUnique({ where: { userId } })
      if (rowForUserId != null) return rowForUserId
      throw new UserEmailConflictError()
    }
    if (!isRecordNotFoundError(error)) throw error
    // Another concurrent call relinked this row between our read above
    // and this update, so the userId guard lost the race safely.
    const relinkedByOtherCall = await prisma.user.findUnique({
      where: { userId }
    })
    if (relinkedByOtherCall == null) throw error
    return relinkedByOtherCall
  }
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
    const emailChanged = email != null && email !== racedUser.email
    if (emailVerified && (!racedUser.emailVerified || emailChanged)) {
      if (
        emailChanged &&
        (await isEmailHeldByAnotherUser(email, racedUser.userId))
      )
        throw new UserEmailConflictError()
      try {
        return await prisma.user.update({
          where: { userId },
          data: { emailVerified: true, ...(email != null && { email }) }
        })
      } catch (syncError) {
        // The synced email already belongs to a different row.
        if (!isUniqueConstraintError(syncError)) throw syncError
        throw new UserEmailConflictError()
      }
    }
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
        const syncedEmail = firebaseUser.email?.trim().toLowerCase()
        if (
          syncedEmail != null &&
          syncedEmail !== existingUser.email &&
          (await isEmailHeldByAnotherUser(syncedEmail, userId))
        )
          throw new UserEmailConflictError()
        const { displayName, photoURL } = resolveProviderProfile(firebaseUser)
        const split = splitDisplayName(displayName)
        try {
          return await prisma.user.update({
            where: { userId },
            data: {
              emailVerified: true,
              ...(split != null && {
                firstName: split.firstName,
                lastName: split.lastName
              }),
              ...(syncedEmail != null && { email: syncedEmail }),
              ...(photoURL != null && { imageUrl: photoURL })
            }
          })
        } catch (error) {
          // The synced email already belongs to a different row.
          if (!isUniqueConstraintError(error)) throw error
          throw new UserEmailConflictError()
        }
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
  // Raw SQL, not `findFirst` with `mode: 'insensitive'`: on Postgres that
  // mode compiles to ILIKE (the `~~*` pattern operator), which a plain
  // btree expression index on LOWER(email) cannot serve, so every lookup
  // would sequentially scan User. LOWER(email) = LOWER($1) is a plain
  // equality predicate the index does serve, and being equality rather
  // than pattern matching, it needs no `%`/`_` wildcard escaping either.
  if (data.email != null) {
    const holderRows = await prisma.$queryRaw<
      Array<{ email: string; userId: string }>
    >`SELECT email, "userId" FROM "User" WHERE LOWER(email) = LOWER(${data.email}) ORDER BY "createdAt" ASC, id ASC LIMIT 1`
    const holder = holderRows?.[0]
    // A holder already keyed to this UID is not a conflict: a concurrent call
    // created this user's row after the lookup by UID above (the Firebase
    // call widens that window). Fall through to create, which fails on the
    // unique UID and lets resolveCreateConflict return and sync that row.
    if (holder != null && holder.userId !== userId) {
      if (!emailVerified) throw new UserEmailConflictError()
      return await relinkUserToFirebaseUid(holder.email, userId)
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
