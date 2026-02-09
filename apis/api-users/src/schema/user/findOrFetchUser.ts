import { Prisma, User, prisma } from '@core/prisma/users/client'
import { auth } from '@core/yoga/firebaseClient'

import { type AppType } from './enums/app'
import { verifyUser } from './verifyUser'

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

  if (existingUser != null && existingUser.emailVerified != null)
    return existingUser

  const {
    displayName,
    email,
    emailVerified,
    photoURL: imageUrl
  } = await auth.getUser(userId)

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

  const data = {
    userId,
    firstName,
    lastName,
    email: email ?? null,
    imageUrl,
    emailVerified
  }

  let user: User | null = null
  let userCreated = false
  // This function can run in parallel; multiple calls may try to create the same user.
  try {
    user = await prisma.user.create({
      data
    })
    userCreated = true
  } catch {
    // Create failed (e.g. P2002 unique constraint from concurrent request). Use existing row or retry create once.
    user = await prisma.user.findUnique({
      where: { userId }
    })
    if (user == null) {
      try {
        user = await prisma.user.create({
        data
      })
        userCreated = true
      } catch {
        user = await prisma.user.findUnique({
          where: { userId }
        })
      }
    }
  }
  // after user create so it is only sent once
  if (email != null && userCreated && !emailVerified)
    await verifyUser(userId, email, redirect, app)
  return user
}
