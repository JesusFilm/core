import { createYoga, useReadinessCheck } from 'graphql-yoga'

import { getUserFromAuthToken } from '@core/yoga/firebaseClient'

import { prisma } from './lib/prisma'
import { schema } from './schema'
import { Context } from './schema/builder'

export const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    const token = request.headers.get('authorization')
    const interopToken = request.headers.get('interop-token')
    const ipAddress = request.headers.get('x-forwarded-for')

    return {
      currentUser:
        token == null || token === ''
          ? null
          : await getUserFromAuthToken(token),
      token,
      interopToken,
      ipAddress
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
