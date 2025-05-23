import MutationQueueLink from '@adobe/apollo-link-mutation-queue'
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  NormalizedCacheObject,
  split
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getMainDefinition } from '@apollo/client/utilities'
import DebounceLink from 'apollo-link-debounce'
import { getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { useMemo } from 'react'

import { cache } from './cache'

const ssrMode = typeof window === 'undefined'
const DEFAULT_DEBOUNCE_TIMEOUT = 500

/**
 * Alternative Apollo Client configuration using graphql-sse for explicit SSE subscriptions
 *
 * To use this approach:
 * 1. Install: npm install graphql-sse
 * 2. Replace the import in your app to use this configuration
 *
 * This approach gives you more control over the SSE connection and is more explicit
 * about using Server-Sent Events for subscriptions.
 */
export function createApolloClientWithSSE(
  token?: string
): ApolloClient<NormalizedCacheObject> {
  // HTTP link for queries and mutations
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL
  })

  // SSE link for subscriptions (only works on client-side)
  let sseLink: ApolloLink | null = null

  if (!ssrMode) {
    // Dynamic import to avoid SSR issues
    void import(/* webpackChunkName: "graphql-sse" */ 'graphql-sse')
      .then(({ createClient, ClientOptions }) => {
        const sseClient = createClient({
          url:
            process.env.NEXT_PUBLIC_GATEWAY_URL?.replace('http', 'ws') ||
            'ws://localhost:4000/graphql',
          headers: async () => {
            const firebaseToken =
              await getAuth(getApp()).currentUser?.getIdToken()
            return {
              'x-graphql-client-name': 'journeys-admin',
              'x-graphql-client-version':
                process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? '',
              Authorization:
                firebaseToken != null ? `JWT ${firebaseToken}` : undefined
            }
          }
        } as ClientOptions)

        // Create a custom link that uses the SSE client
        sseLink = new ApolloLink((operation, forward) => {
          return new Promise((resolve, reject) => {
            const unsubscribe = sseClient.subscribe(
              { ...operation, query: operation.query },
              {
                next: (data) => resolve(data),
                error: (error) =>
                  reject(
                    error instanceof Error ? error : new Error(String(error))
                  ),
                complete: () => resolve(undefined)
              }
            )

            // Return cleanup function
            return () => unsubscribe()
          })
        })
      })
      .catch((error) => {
        console.error('Failed to load graphql-sse:', error)
      })
  }

  const authLink = setContext(async (_, { headers }) => {
    const firebaseToken = ssrMode
      ? token
      : ((await getAuth(getApp()).currentUser?.getIdToken()) ?? token)

    return {
      headers: {
        ...(!ssrMode ? headers : []),
        'x-graphql-client-name': 'journeys-admin',
        'x-graphql-client-version':
          process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? '',
        Authorization:
          firebaseToken != null ? `JWT ${firebaseToken}` : undefined
      }
    }
  })

  const mutationQueueLink = new MutationQueueLink()
  const debounceLink = new DebounceLink(DEFAULT_DEBOUNCE_TIMEOUT)

  // Split link: use SSE for subscriptions, HTTP for queries/mutations
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    sseLink || httpLink, // Fallback to HTTP if SSE not available
    httpLink
  )

  const link = ApolloLink.from([
    debounceLink,
    mutationQueueLink,
    authLink,
    splitLink
  ])

  return new ApolloClient({
    ssrMode,
    link,
    cache: cache(),
    connectToDevTools: true
  })
}

/**
 * Hook version for React components
 */
export function useApolloClientWithSSE(
  token?: string
): ApolloClient<NormalizedCacheObject> {
  return useMemo(() => createApolloClientWithSSE(token), [token])
}
