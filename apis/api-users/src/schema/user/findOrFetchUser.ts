import { GraphQLError } from 'graphql'

import { Prisma, User, prisma } from '@core/prisma/users/client'
import {
  type UserRecord,
  auth,
  sanitizeDisplayName,
  sanitizePhotoURL,
  splitDisplayName
} from '@core/yoga/firebaseClient'

import { type AppType } from './enums/app'
import { verifyUser } from './verifyUser'

const ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED = 'P2002'

// Thrown when a sign-in's email already belongs to a User row keyed to a
// different Firebase UID and Firebase has not verified that email, so the
// row cannot safely be re-linked to the new UID. Re-linking on an unverified
// email would hand an existing account to whoever registered the address.
export class UserEmailConflictError extends GraphQLError {
  constructor() {
    super(
      'This email is already linked to another account. Verify the email address to sign in with it.',
      { extensions: { code: 'USER_EMAIL_CONFLICT' } }
    )
    this.name = 'UserEmailConflictError'
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED
  )
}

// Moves the row holding this email onto the new Firebase UID. Only `userId`
// changes, so the row keeps its id and everything on it (superAdmin,
// createdAt, profile). The `userId` guard on the update makes a concurrent
// change to the row fail the write instead of being overwritten.
async function relinkUserToFirebaseUid(
  email: string,
  userId: string
): Promise<User> {
  return await prisma.$transaction(async (tx) => {
    const holder = await tx.user.findUnique({ where: { email } })
    if (holder == null)
      throw new Error('User row holding the email disappeared during re-link')
    if (holder.userId === userId) return holder

    const relinked = await tx.user.update({
      where: { id: holder.id, userId: holder.userId },
      data: { userId, emailVerified: true }
    })
    console.warn(
      `findOrFetchUser: re-linked User ${holder.id} from Firebase UID ${holder.userId} to ${userId} on verified email`
    )
    return relinked
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
  if (racedUser != null) return racedUser

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
    email: email ?? null,
    imageUrl,
    emailVerified
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
