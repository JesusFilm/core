import { Prisma, User, prisma } from '@core/prisma-users/client'
import { auth } from '@core/yoga/firebaseClient'

import { verifyUser } from './verifyUser'

export async function findOrFetchUser(
  query: { select?: Prisma.UserSelect; include?: undefined },
  userId: string,
  redirect: string | undefined = undefined
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
        id: userId
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
    email: email ?? '',
    imageUrl,
    emailVerified
  }

  let user: User | null = null
  let retry = 0
  let userCreated = false
  // this function can run in parallel as such it is possible for multiple
  // calls to reach this point and try to create the same user
  // due to the earlier firebase async call.
  try {
    user = await prisma.user.create({
      data
    })
    userCreated = true
  } catch (e) {
    do {
      user = await prisma.user.update({
        where: {
          id: userId
        },
        data
      })
      retry++
    } while (user == null && retry < 3)
  }
  // after user create so it is only sent once
  if (email != null && userCreated && !emailVerified)
    await verifyUser(userId, email, redirect)
  return user
}
