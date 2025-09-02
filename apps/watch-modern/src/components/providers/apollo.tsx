"use client"

import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client'
import type { ReactNode } from 'react'

function createApolloClient() {
  const uri = process.env['NEXT_PUBLIC_GATEWAY_URL'] ?? '/api/graphql'

  return new ApolloClient({
    link: new HttpLink({ uri, credentials: 'include' }),
    cache: new InMemoryCache()
  })
}

export function ApolloClientProvider({ children }: { children: ReactNode }) {
  const client = createApolloClient()
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
