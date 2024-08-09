import { createYoga, useReadinessCheck } from 'graphql-yoga'

import { User, getUserFromAuthToken } from '@core/yoga/firebaseClient'

import { prisma } from './lib/prisma'
import { schema } from './schema'

export interface Context {
  currentUser: User | null
  token?: string
}

export const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    const token = request.headers.get('authorization')
    // ?.replace(/^Bearer\s/, '')
    if (token == null || token === '')
      return {
        currentUser: null,
        token: null
      }
    return {
      currentUser: await getUserFromAuthToken(token),
      token
    } satisfies Context
  },
  plugins: [
    useReadinessCheck({
      endpoint: '/.well-known/apollo/server-health',
      check: async () => {
        await prisma.$queryRaw`SELECT 1`
      }
    })
  ]
})
