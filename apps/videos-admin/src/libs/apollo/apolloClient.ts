import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { Defer20220824Handler } from '@apollo/client/incremental'
import { LocalState } from '@apollo/client/local-state'
import { registerApolloClient } from '@apollo/client-integration-nextjs'
import { cookies } from 'next/headers'
import { getTokens } from 'next-firebase-auth-edge'

import { authConfig } from '../auth'

import { cache } from './cache'

/*
Start: Inserted by Apollo Client 3->4 migration codemod.
Copy the contents of this block into a `.d.ts` file in your project to enable correct response types in your custom links.
If you do not use the `@defer` directive in your application, you can safely remove this block.
*/

export const {
  getClient: getApolloClient,
  query,
  PreloadQuery
} = registerApolloClient(async () => {
  const tokens = await getTokens(await cookies(), authConfig)

  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
    headers: {
      'x-graphql-client-name': 'videos-admin',
      'x-graphql-client-version':
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? '',
      Authorization: tokens?.token != null ? `JWT ${tokens.token}` : ''
    },
    fetchOptions: {
      // Next.js specific options for caching and revalidation
      // See: https://nextjs.org/docs/app/api-reference/functions/fetch#fetchurl-options
      next: {
        revalidate: 60 // Adjust based on your needs
      }
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(cache),

    // Prevent shared cache between RSC and client components to avoid conflicts
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only'
      }
    },

    /*
    Inserted by Apollo Client 3->4 migration codemod.
    If you are not using the `@client` directive in your application,
    you can safely remove this option.
    */
    localState: new LocalState({}),

    devtools: {
      enabled: process.env.NODE_ENV === 'development'
    },

    /*
    Inserted by Apollo Client 3->4 migration codemod.
    If you are not using the `@defer` directive in your application,
    you can safely remove this option.
    */
    incrementalHandler: new Defer20220824Handler()
  })
})

declare module '@apollo/client' {
  export interface TypeOverrides extends Defer20220824Handler.TypeOverrides {}
}

/*
End: Inserted by Apollo Client 3->4 migration codemod.
*/
