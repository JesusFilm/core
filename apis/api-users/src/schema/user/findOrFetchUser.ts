import { Prisma, User, prisma } from '@core/prisma/users/client'
import { auth } from '@core/yoga/firebaseClient'

import { verifyUser } from './verifyUser'

export type FindOrFetchUserOptions = {
  /** When true, create a database user even for anonymous Firebase users (e.g. "Create Guest"). */
  forceCreateForAnonymous?: boolean
}

export async function findOrFetchUser(
  query: { select?: Prisma.UserSelect; include?: undefined },
  userId: string,
  redirect: string | undefined = undefined,
  options: FindOrFetchUserOptions = {}
): Promise<User | null> {
  const { forceCreateForAnonymous = false } = options

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

  if (existingUser != null && existingUser.emailVerified != null)
    return existingUser

  const firebaseUser = await auth.getUser(userId)

  const isAnonymous =
    firebaseUser.providerData == null || firebaseUser.providerData.length === 0

  // Do not create a database user for anonymous Firebase users unless explicitly requested.
  if (isAnonymous && !forceCreateForAnonymous) {
    return null
  }

  const { displayName, email, emailVerified, photoURL: imageUrl } = firebaseUser

  // Extract firstName and lastName from displayName with better fallbacks
  let firstName = ''
  let lastName = ''

  if (displayName?.trim()) {
    const nameParts = displayName
      .trim()
      .split(' ')
      .filter((part) => part.length > 0)
    if (nameParts.length === 1) {
      // Single name - use as firstName
      firstName = nameParts[0]
    } else if (nameParts.length > 1) {
      // Multiple parts - first parts as firstName, last part as lastName
      firstName = nameParts.slice(0, -1).join(' ')
      lastName = nameParts[nameParts.length - 1]
    }
  }

  // Ensure firstName is never empty for database constraint
  if (!firstName.trim()) {
    firstName = 'Unknown User'
  }

  // Schema has email String?; use assertion so nullable email compiles with any Prisma client version
  const createData = {
    userId,
    firstName,
    lastName,
    email: email ?? null,
    imageUrl: imageUrl ?? null,
    emailVerified
  } as Prisma.UserUncheckedCreateInput

  let user: User | null = null
  let userCreated = false
  // This can run in parallel; multiple calls may try to create the same user.
  try {
    user = await prisma.user.create({
      data: createData
    })
    userCreated = true
  } catch (createErr) {
    // Create failed - often unique constraint (concurrent request already created). Fetch existing.
    user = await prisma.user.findUnique({
      ...query,
      where: { userId }
    })
    if (user == null) throw createErr
  }
  // after user create so it is only sent once
  if (email != null && userCreated && !emailVerified)
    await verifyUser(userId, email, redirect)
  return user
}
