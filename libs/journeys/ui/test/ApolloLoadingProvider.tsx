import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable
} from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import noop from 'lodash/noop'
import { ReactElement, ReactNode } from 'react'

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
    cache: new InMemoryCache()
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
