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
          userId
        },
        data
      })
      retry++
    } while (user == null && retry < 3)
  }
  // after user create so it is only sent once
  if (email != null && userCreated && !emailVerified)
    await verifyUser(userId, email, redirect, app)
  return user
}
