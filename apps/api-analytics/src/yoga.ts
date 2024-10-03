import { authZEnvelopPlugin } from '@graphql-authz/envelop-plugin'
import { useHmacSignatureValidation } from '@graphql-hive/gateway'
import { initContextCache } from '@pothos/core'
import { createYoga, useReadinessCheck } from 'graphql-yoga'

import { getUserFromApiKey } from './lib/auth'
import { prisma } from './lib/prisma'
import { rules } from './lib/rules'
import { schema } from './schema'
import { Context } from './schema/builder'

export const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    const apiKey = request.headers
      .get('authorization')
      ?.replace(/^Bearer\s/, '')

    return {
      ...initContextCache(),
      currentUser: await getUserFromApiKey(apiKey),
      apiKey
    } satisfies Context
  },
  plugins: [
    process.env.NODE_ENV !== 'test'
      ? useHmacSignatureValidation({
          secret: process.env.GATEWAY_HMAC_SECRET ?? ''
        })
      : {},
    authZEnvelopPlugin({ rules }),
    useReadinessCheck({
      endpoint: '/.well-known/apollo/server-health',
      check: async () => {
        // if resolves, respond with 200 OK
        // if throw, respond with 503 Service Unavailable
        await prisma.$queryRaw`SELECT 1`
      }
    })
  ]
})
