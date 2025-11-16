'use client'

import { useApolloClient } from '@apollo/client'

import { ME_QUERY, type User } from './query'

export async function getUser(): Promise<User | null> {
  const apolloClient = useApolloClient()
  const result = await apolloClient.query({
    query: ME_QUERY
  })

  return result.data.me ?? null
}
