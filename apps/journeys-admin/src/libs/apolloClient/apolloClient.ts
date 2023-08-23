import {
  ApolloClient,
  NormalizedCacheObject,
  createHttpLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import jwt from 'jsonwebtoken'
import { AuthUser } from 'next-firebase-auth'
import { useMemo } from 'react'

import { cache } from './cache'

export function isTokenExpired(token: string): boolean {
  try {
    const decodedToken = jwt.decode(token) as { exp: number }
    const tokenExpiresAt = decodedToken.exp
    const now = Math.floor(Date.now() / 1000)
    return now > tokenExpiresAt
  } catch (error) {
    console.error(error)
    return true
  }
}

export function createApolloClient(
  token: string
): ApolloClient<NormalizedCacheObject> {
  const isSsrMode = typeof window === 'undefined'
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL
  })

  const authLink = setContext(async (_, { headers }) => {
    // If this is SSR, DO NOT PASS THE REQUEST HEADERS.
    // Just send along the authorization headers.
    // The **correct** headers will be supplied by the `getServerSideProps` invocation of the query

    let refreshToken
    // Check if we are in SSR mode and load the AuthUser module
    if (isSsrMode) {
      const { verifyIdToken } = await import(
        /* webpackChunkName: "next-firebase-auth" */
        'next-firebase-auth'
      )
      const authUser: AuthUser = await verifyIdToken(token)
      const newToken = await authUser.getIdToken(true)
      if (newToken != null) {
        refreshToken = newToken
      }
    }

    return {
      headers: {
        ...(!isSsrMode ? headers : []),
        Authorization: isTokenExpired(token) ? refreshToken : token
      }
    }
  })

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: authLink.concat(httpLink),
    cache: cache(),
    name: 'journeys-admin',
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
  })
}

export function useApollo(token: string): ApolloClient<NormalizedCacheObject> {
  return useMemo(() => createApolloClient(token), [token])
}
