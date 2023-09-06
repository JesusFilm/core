import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable
} from '@apollo/client'
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
    cache: new InMemoryCache(),
    name: 'journeys-ui-test',
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
