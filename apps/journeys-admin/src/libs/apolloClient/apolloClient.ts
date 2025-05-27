import MutationQueueLink from '@adobe/apollo-link-mutation-queue'
import {
  ApolloClient,
  ApolloLink,
  FetchResult,
  HttpLink,
  NextLink,
  NormalizedCacheObject,
  Operation,
  from,
  split
} from '@apollo/client'
import { EntityStore, StoreObject } from '@apollo/client/cache'
import { setContext } from '@apollo/client/link/context'
import { getMainDefinition } from '@apollo/client/utilities'
import DebounceLink from 'apollo-link-debounce'
import { getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { createClient } from 'graphql-sse'
import { useMemo } from 'react'
import { Observable } from 'zen-observable-ts'

import { cache } from './cache'

const ssrMode = typeof window === 'undefined'
let apolloClient: ApolloClient<NormalizedCacheObject>

const DEFAULT_DEBOUNCE_TIMEOUT = 500

// Custom Apollo Link for Server-Sent Events using graphql-sse
class SSELink extends ApolloLink {
  private url: string
  private options: any

  constructor(url: string, options?: any) {
    super()
    this.url = url
    this.options = options || {}
  }

  public request(
    operation: Operation,
    forward?: NextLink
  ): Observable<FetchResult> | null {
    return new Observable<FetchResult>((observer) => {
      // Get headers from operation context
      const context = operation.getContext()
      const headers = context.headers || {}

      // Create a new client instance with current headers
      const client = createClient({
        url: this.url,
        ...this.options,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream'
        }
      })

      const unsubscribe = client.subscribe(
        {
          query: operation.query.loc?.source?.body || '',
          variables: operation.variables,
          operationName: operation.operationName
        },
        {
          next: (data) => {
            observer.next(data as FetchResult)
          },
          error: (error) => {
            observer.error(
              error instanceof Error ? error : new Error(String(error))
            )
          },
          complete: () => {
            observer.complete()
          }
        }
      )

      // Return cleanup function
      return () => {
        unsubscribe()
      }
    })
  }
}

export function createApolloClient(
  token?: string
): ApolloClient<NormalizedCacheObject> {
  const gatewayUrl =
    process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000'

  // Create HTTP link for queries and mutations
  const httpLink = new HttpLink({
    uri: gatewayUrl
  })

  // Create SSE link for subscriptions using graphql-sse
  const sseLink = new SSELink(gatewayUrl)

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
    sseLink,
    httpLink
  )

  const link = from([debounceLink, mutationQueueLink, authLink, splitLink])

  return new ApolloClient({
    ssrMode,
    link,
    cache: cache(),
    connectToDevTools: true
  })
}

interface InitializeApolloOptions {
  token?: string
  initialState?: NormalizedCacheObject
}

export function initializeApollo({
  token,
  initialState
}: InitializeApolloOptions): ApolloClient<NormalizedCacheObject> {
  const _apolloClient = apolloClient ?? createApolloClient(token)

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState != null) {
    // Restore the cache using the data passed from
    // getStaticProps/getServerSideProps combined with the existing cached data
    // https://github.com/apollographql/apollo-client/issues/9797#issuecomment-1156604315
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see gh ^
    const currentStore: EntityStore = (_apolloClient.cache as any).data

    Object.keys(initialState).forEach((dataId) => {
      currentStore.merge(dataId, initialState[dataId] as StoreObject)
    })
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient
  // Create the Apollo Client once in the client
  if (apolloClient == null) apolloClient = _apolloClient
  return _apolloClient
}

export function useApollo({
  token,
  initialState
}: InitializeApolloOptions): ApolloClient<NormalizedCacheObject> {
  const store = useMemo(
    () => initializeApollo({ token, initialState }),
    [token, initialState]
  )
  return store
}
