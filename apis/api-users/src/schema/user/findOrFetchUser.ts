import { Prisma, User, prisma } from '@core/prisma/users/client'

import { verifyUser } from './verifyUser'

export interface CurrentUserFromCtx {
  id: string
  firstName: string
  lastName?: string
  email?: string | null
  imageUrl?: string | null
  emailVerified: boolean
}

export async function findOrFetchUser(
  query: { select?: Prisma.UserSelect; include?: undefined },
  userId: string,
  redirect: string | undefined = undefined,
  ctxCurrentUser?: CurrentUserFromCtx
): Promise<User | null> {
  const existingUser = await prisma.user.findUnique({
    ...query,
    where: {
      userId
    }
  })

  // if a user converts from a guest user to a registered user, we need to update the user and sent verification email
  if (ctxCurrentUser?.email != null && existingUser?.email == null) {
    const user = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        email: ctxCurrentUser.email,
        firstName: ctxCurrentUser.firstName,
        lastName: ctxCurrentUser.lastName,
        imageUrl: ctxCurrentUser.imageUrl,
        emailVerified: false
      }
    })
    if (user.email != null && !user.emailVerified)
      void verifyUser(userId, user.email, redirect)
    return user
  }

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

  const data = {
    userId,
    firstName:
      ctxCurrentUser?.firstName ?? ctxCurrentUser?.lastName ?? 'Unknown User',
    lastName: ctxCurrentUser?.lastName != null ? ctxCurrentUser.lastName : null,
    email: ctxCurrentUser?.email,
    imageUrl: ctxCurrentUser?.imageUrl,
    emailVerified: ctxCurrentUser?.emailVerified
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
  if (
    ctxCurrentUser?.email != null &&
    userCreated &&
    !ctxCurrentUser?.emailVerified
  )
    await verifyUser(userId, ctxCurrentUser?.email, redirect)
  return user
}
