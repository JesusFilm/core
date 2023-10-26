// this file modified from https://github.com/gladly-team/next-firebase-auth/blob/v1.x/src/setAuthCookies.ts to use next-firebase-auth-edge on api routes
import { NextApiRequest, NextApiResponse } from 'next'
import { getFirebaseAuth } from 'next-firebase-auth-edge/lib/auth'

import { getFirebasePrivateKey } from '@core/shared/ui/getFirebasePrivateKey'

import { authConfig } from '../firebaseClient/initAuth'

import { getUserCookieName, getUserTokensCookieName } from './authCookies'
import { setCookie } from './cookies'

export type SetAuthCookies = (
  req: NextApiRequest,
  res: NextApiResponse,
  options: { token?: string }
) => Promise<void>

interface User {
  readonly id: string
  readonly email?: string
  readonly emailVerified: boolean
  readonly displayName?: string
  readonly photoURL?: string
  readonly phoneNumber?: string
  readonly disabled: boolean
}

function firebaseEdgeUserTofirebaseAuthUser(firebaseUser): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    emailVerified: firebaseUser.emailVerified,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    phoneNumber: firebaseUser.phoneNumber,
    disabled: firebaseUser.disabled
  }
}

export const setAuthCookies: SetAuthCookies = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { token: userProvidedToken }: { token?: string } = {}
) => {
  // logDebug('[setAuthCookies] Attempting to set auth cookies.')

  // This should be the original Firebase ID token from
  // the Firebase JS SDK.
  const token = userProvidedToken ?? req.headers.authorization
  if (token == null) {
    throw new Error(
      'The request must have an Authorization header value, or you should explicitly provide an ID token to "setAuthCookies".'
    )
  }

  const { createUser, getCustomIdAndRefreshTokens, getUser } = getFirebaseAuth(
    {
      privateKey: getFirebasePrivateKey(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
      clientEmail: process.env.PRIVATE_FIREBASE_CLIENT_EMAIL ?? ''
    },
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? ''
  )

  // Get a custom ID token and refresh token, given a valid Firebase ID
  // token. If the token isn't valid, set cookies for an unauthenticated
  // user.
  let idToken: string | null = null
  let refreshToken: string | null = null
  let firebaseUser = await createUser({}) // default to an unauthed user
  let user = firebaseEdgeUserTofirebaseAuthUser(firebaseUser)
  try {
    ;({ idToken, refreshToken } = await getCustomIdAndRefreshTokens(
      token,
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? ''
    ))
    firebaseUser = await getUser(idToken)
    user = firebaseEdgeUserTofirebaseAuthUser(firebaseUser)
  } catch (e) {
    // logDebug(
    //   '[setAuthCookies] Failed to verify the ID token. Cannot authenticate the user or get a refresh token.'
    // )
  }

  // Pick a subset of the config.cookies options to
  // pass to setCookie.
  const cookieOptions = (({
    httpOnly,
    keys,
    maxAge,
    overwrite,
    path,
    sameSite,
    secure,
    signed
  }) => ({
    httpOnly,
    keys,
    maxAge,
    overwrite,
    path,
    sameSite,
    secure,
    signed
  }))(authConfig.cookies)

  // Store the ID and refresh tokens in a cookie. This
  // cookie will be available to future requests to pages,
  // providing a valid Firebase ID token (refreshed as needed)
  // for server-side rendering.
  setCookie(
    getUserTokensCookieName(),
    // Note: any change to cookie data structure needs to be
    // backwards-compatible.
    JSON.stringify({
      idToken,
      refreshToken
    }),
    { req, res },
    cookieOptions
  )

  // Store the user data. This cookie will be available
  // to future requests to pages, providing the user data. It
  // will *not* include a Firebase ID token, because it may have
  // expired, but provides the user data without any
  // additional server-side requests.
  setCookie(
    getUserCookieName(),
    // Note: any change to cookie data structure needs to be
    // backwards-compatible.
    // Don't include the token in the user cookie, because
    // the token should only be used from the "userTokens"
    // cookie. Here, it is redundant information, and we don't
    // want the token to be used if it's expired.
    JSON.stringify(user),
    {
      req,
      res
    },
    cookieOptions
  )

  // if (user.id != null) {
  //   logDebug('[setAuthCookies] Set auth cookies for an authenticated user.')
  // } else {
  //   logDebug(
  //     '[setAuthCookies] Set auth cookies. The user is not authenticated.'
  //   )
  // }

  // return {
  //   idToken,
  //   refreshToken,
  //   user
  // }
}

export default setAuthCookies
