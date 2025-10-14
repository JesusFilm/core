import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable
} from '@apollo/client'
import { Defer20220824Handler } from '@apollo/client/incremental'
import { LocalState } from '@apollo/client/local-state'
import { ApolloProvider } from '@apollo/client/react'
import noop from 'lodash/noop'
import { ReactElement, ReactNode } from 'react'

/*
Start: Inserted by Apollo Client 3->4 migration codemod.
Copy the contents of this block into a `.d.ts` file in your project to enable correct response types in your custom links.
If you do not use the `@defer` directive in your application, you can safely remove this block.
*/

interface ApolloLoadingProviderProps {
  children?: ReactNode
}
export const ApolloLoadingProvider = ({
  children
}: ApolloLoadingProviderProps): ReactElement => {
  const link = new ApolloLink(() => {
    return new Observable(noop)
  })

  const client = new ApolloClient({
    link,
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

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

declare module '@apollo/client' {
  export interface TypeOverrides extends Defer20220824Handler.TypeOverrides {}
}

/*
End: Inserted by Apollo Client 3->4 migration codemod.
*/
