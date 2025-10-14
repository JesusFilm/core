import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { Defer20220824Handler } from '@apollo/client/incremental'
import { LocalState } from '@apollo/client/local-state'
import { registerApolloClient } from '@apollo/client-integration-nextjs'

/*
Start: Inserted by Apollo Client 3->4 migration codemod.
Copy the contents of this block into a `.d.ts` file in your project to enable correct response types in your custom links.
If you do not use the `@defer` directive in your application, you can safely remove this block.
*/

const ONE_HOUR_IN_SECONDS = 60 * 60 // 60 seconds times 60 minutes

export const { getClient: getApolloClient } = registerApolloClient(() => {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GATEWAY_URL,
    headers: {
      'x-graphql-client-name': 'short-links',
      'x-graphql-client-version':
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
    },
    fetchOptions: {
      next: {
        revalidate: ONE_HOUR_IN_SECONDS
      }
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),

    /*
    Inserted by Apollo Client 3->4 migration codemod.
    If you are not using the `@client` directive in your application,
    you can safely remove this option.
    */
    localState: new LocalState({}),

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
