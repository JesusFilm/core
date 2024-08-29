import { registerApolloClient } from '@apollo/experimental-nextjs-app-support'
import { cookies } from 'next/headers'
import { getTokens } from 'next-firebase-auth-edge'

import { authConfig } from '../auth'

import { makeClient } from './makeClient'

export const { getClient: getApolloClient, query } = registerApolloClient(
  async () => {
    const token = await getTokens(cookies(), authConfig)
    return makeClient({
      headers: { Authorization: token?.token ?? '' }
    })
  }
)
