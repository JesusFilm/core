import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

import { cache } from './cache'

/*
Start: Inserted by Apollo Client 3->4 migration codemod.
Copy the contents of this block into a `.d.ts` file in your project to enable correct response types in your custom links.
If you do not use the `@defer` directive in your application, you can safely remove this block.
*/

export function makeClient(options?: HttpLink.Options): ApolloClient {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
    ...options,
    headers: {
      ...options?.headers,
      'x-graphql-client-name': 'videos-admin',
      'x-graphql-client-version':
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(cache),
    devtools: {
      enabled: true
    }
  })
}
