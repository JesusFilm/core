import {
  useForwardedJWT,
  useHmacSignatureValidation
} from '@graphql-hive/gateway'
import {
  createInMemoryCache,
  useResponseCache
} from '@graphql-yoga/plugin-response-cache'
import { initContextCache } from '@pothos/core'
import { createYoga, useReadinessCheck } from 'graphql-yoga'
import get from 'lodash/get'

import { getUserIdFromRequest } from '@core/yoga/firebaseClient/firebaseClient'

import { prisma } from './lib/prisma'
import { schema } from './schema'
import { Context } from './schema/builder'

export const cache = createInMemoryCache()

export const yoga = createYoga({
  schema,
  context: async ({ request, params }) => {
    const payload = get(params, 'extensions.jwt.payload')
    const userId = await getUserIdFromRequest(request, payload)

    return {
      ...initContextCache(),
      userId,
      currentRoles:
        userId != null
          ? (
              await prisma.userMediaRole.findUnique({
                where: { userId }
              })
            )?.roles ?? null
          : null
    } satisfies Context
  },
  plugins: [
    useForwardedJWT({}),
    process.env.NODE_ENV !== 'test'
      ? useHmacSignatureValidation({
          secret: process.env.GATEWAY_HMAC_SECRET ?? ''
        })
      : {},
    useReadinessCheck({
      endpoint: '/.well-known/apollo/server-health',
      check: async () => {
        await prisma.$queryRaw`SELECT 1`
      }
    }),
    process.env.NODE_ENV !== 'test'
      ? useResponseCache({
          session: () => null,
          cache,
          ttlPerSchemaCoordinate: {
            'Query.getMyCloudflareVideo': 0
          },
          ttlPerType: {
            User: 1000
          }
        })
      : {}
  ]
})
