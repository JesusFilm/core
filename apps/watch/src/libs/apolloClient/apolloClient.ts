import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  NormalizedCacheObject
} from '@apollo/client'
import { Defer20220824Handler } from '@apollo/client/incremental'
import { setContext } from '@apollo/client/link/context'
import { RetryLink } from '@apollo/client/link/retry'
import { LocalState } from '@apollo/client/local-state'
import fetch from 'cross-fetch'
import { useMemo } from 'react'

import { cache } from './cache'

/*
Start: Inserted by Apollo Client 3->4 migration codemod.
Copy the contents of this block into a `.d.ts` file in your project to enable correct response types in your custom links.
If you do not use the `@defer` directive in your application, you can safely remove this block.
*/

interface CreateApolloClientParams {
  token?: string
  initialState?: NormalizedCacheObject
}

export function createApolloClient({
  token,
  initialState
}: CreateApolloClientParams = {}): ApolloClient {
  const isSsrMode = typeof window === 'undefined'
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
    fetch
  })

  const authLink = setContext(async (_, { headers }) => {
    // If this is SSR, DO NOT PASS THE REQUEST HEADERS.
    // Just send along the authorization headers.
    // The **correct** headers will be supplied by the `getServerSideProps` invocation of the query
    return {
      headers: {
        ...(!isSsrMode ? headers : []),
        Authorization: token != null ? `JWT ${token}` : undefined,
        'x-graphql-client-name': 'watch',
        'x-graphql-client-version':
          process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
      }
    }
  })

  const retryLink = new RetryLink({
    delay: {
      initial: 500,
      max: Number.POSITIVE_INFINITY,
      jitter: true
    },
    attempts: {
      max: 5
    }
  })

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: ApolloLink.from([retryLink, authLink, httpLink]),
    cache: cache().restore(initialState ?? {}),

    /*
    Inserted by Apollo Client 3->4 migration codemod.
    If you are not using the `@client` directive in your application,
    you can safely remove this option.
    */
    localState: new LocalState({}),

    devtools: {
      enabled: true
    },

    /*
    Inserted by Apollo Client 3->4 migration codemod.
    If you are not using the `@defer` directive in your application,
    you can safely remove this option.
    */
    incrementalHandler: new Defer20220824Handler()
  })
}

export function useApolloClient({
  token,
  initialState
}: CreateApolloClientParams = {}): ApolloClient {
  return useMemo(
    () => createApolloClient({ token, initialState }),
    [token, initialState]
  )
}

declare module '@apollo/client' {
  export interface TypeOverrides extends Defer20220824Handler.TypeOverrides {}
}

/*
End: Inserted by Apollo Client 3->4 migration codemod.
*/
