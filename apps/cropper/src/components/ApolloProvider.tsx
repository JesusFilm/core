'use client'

import { ApolloProvider as BaseApolloProvider } from '@apollo/client'
import { ReactNode } from 'react'
import { createApolloClient } from '../lib/apollo-client'

interface ApolloProviderProps {
  children: ReactNode
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  const client = createApolloClient()

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>
}
