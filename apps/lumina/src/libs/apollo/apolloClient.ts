import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { registerApolloClient } from '@apollo/client-integration-nextjs'
import { cookies } from 'next/headers'
import { getTokens } from 'next-firebase-auth-edge'

import { env } from '@/env'
import { cache } from '@/libs/apollo/cache'
import { authConfig } from '@/libs/auth/server-config'

export const { getClient: getApolloClient } = registerApolloClient(async () => {
  const tokens = await getTokens(await cookies(), authConfig)

  const httpLink = new HttpLink({
    uri: env.NEXT_PUBLIC_GATEWAY_URL,
    headers: {
      'x-graphql-client-name': 'lumina',
      'x-graphql-client-version': env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? '',
      Authorization: tokens?.token != null ? `JWT ${tokens.token}` : ''
    },
    fetchOptions: {
      cache: 'no-store'
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(cache)
  })
})
