import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { BatchHttpLink } from '@apollo/client/link/batch-http'
import { setContext } from '@apollo/client/link/context'
import { User } from 'next-firebase-auth'
import { useMemo } from 'react'

import { cache } from './cache'

export function createApolloClient(
  user: User
): ApolloClient<NormalizedCacheObject> {
  const httpLink = new BatchHttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL
  })

  const authLink = setContext(async (_) => {
    const Authorization = await user.getIdToken()

    return {
      headers: {
        Authorization
      }
    }
  })

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: cache(),
    name: 'journeys-admin',
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    connectToDevTools: true
  })
}

export function useApollo(token: string): ApolloClient<NormalizedCacheObject> {
  return useMemo(() => createApolloClient(token), [token])
}
