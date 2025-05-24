import MutationQueueLink from '@adobe/apollo-link-mutation-queue'
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  NormalizedCacheObject,
  split
} from '@apollo/client'
import { EntityStore, StoreObject } from '@apollo/client/cache'
import { setContext } from '@apollo/client/link/context'
import { getMainDefinition } from '@apollo/client/utilities'
import DebounceLink from 'apollo-link-debounce'
import { getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { useMemo } from 'react'
import { Observable } from 'zen-observable-ts'

import { cache } from './cache'

const ssrMode = typeof window === 'undefined'
let apolloClient: ApolloClient<NormalizedCacheObject>

const DEFAULT_DEBOUNCE_TIMEOUT = 500

// Custom SSE Link for subscriptions
class SSELink extends ApolloLink {
  private uri: string

  constructor(uri: string) {
    super()
    this.uri = uri
  }

  public request(operation: any) {
    return new Observable((observer) => {
      const { query, variables } = operation

      // Create the subscription request
      const body = JSON.stringify({
        query: query.loc?.source?.body || '',
        variables
      })

      // Get auth headers from context
      const headers = operation.getContext().headers || {}

      fetch(this.uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
          ...headers
        },
        body
      })
        .then((response) => {
          console.log('SSE Link: Response status:', response.status)
          console.log(
            'SSE Link: Response headers:',
            Object.fromEntries(response.headers.entries())
          )

          if (!response.ok) {
            observer.error(
              new Error(`HTTP ${response.status}: ${response.statusText}`)
            )
            return
          }

          if (!response.body) {
            observer.error(new Error('No response body'))
            return
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          const readStream = () => {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  observer.complete()
                  return
                }

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')

                // Keep the last incomplete line in the buffer
                buffer = lines.pop() || ''

                for (const line of lines) {
                  console.log('SSE Link: Processing line:', line)
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim()
                    if (data && data !== '') {
                      try {
                        const parsed = JSON.parse(data)
                        console.log('SSE Link: Parsed data:', parsed)
                        if (parsed.data || parsed.errors) {
                          observer.next({
                            data: parsed.data,
                            errors: parsed.errors
                          })
                        }
                      } catch (e) {
                        console.warn('Failed to parse SSE data:', data, e)
                      }
                    }
                  } else if (line.startsWith('event: complete')) {
                    console.log('SSE Link: Received complete event')
                    observer.complete()
                    return
                  }
                }

                readStream()
              })
              .catch((error) => observer.error(error))
          }

          readStream()
        })
        .catch((error) => observer.error(error))

      // Return cleanup function
      return () => {
        // Cleanup if needed
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

  // Create SSE link for subscriptions - temporarily use direct service URL to bypass gateway
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
