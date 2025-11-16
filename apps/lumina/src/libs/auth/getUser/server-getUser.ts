import { cookies } from 'next/headers'
import { getTokens } from 'next-firebase-auth-edge'

import { ME_QUERY, type User } from './query'

import { getApolloClient } from '@/libs/apollo/apolloClient'
import { authConfig } from '@/libs/auth/server-config'

export async function getUser(): Promise<(User & { token: string }) | null> {
  const tokens = await getTokens(await cookies(), authConfig)
  if (tokens == null) return null

  try {
    const client = await getApolloClient()
    const result = await client.query({
      query: ME_QUERY
    })

    return result.data.me != null
      ? {
          ...result.data.me,
          token: tokens.token
        }
      : null
  } catch {
    return null
  }
}
