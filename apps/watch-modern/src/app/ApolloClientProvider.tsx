"use client"

import type { ReactNode } from 'react'
import { ApolloProvider } from '@apollo/client'

import { useApolloClient } from '@/libs/apolloClient'

interface ApolloClientProviderProps {
  children: ReactNode
}

export function ApolloClientProvider({ children }: ApolloClientProviderProps) {
  const client = useApolloClient()
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}