// eslint-disable-next-line import/order -- Must be imported first
import { tracingPlugin } from '@core/yoga/tracer'

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

import { prisma } from '@core/prisma-media/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'
import { getInteropContext } from '@core/yoga/interop'

import { logger } from './logger'
import { schema } from './schema'
import { Context } from './schema/builder'

export const cache = createInMemoryCache()

export const yoga = createYoga<
  Record<string, unknown>,
  Context & ReturnType<typeof initContextCache>
>({
  schema,
  logging: logger,
  context: async ({ request, params }) => {
    const payload = get(params, 'extensions.jwt.payload')
    const user = getUserFromPayload(payload, logger)
    const clientName = request.headers.get('x-graphql-client-name') ?? undefined

    if (user != null)
      return {
        ...initContextCache(),
        type: 'authenticated',
        user,
        currentRoles:
          (
            await prisma.userMediaRole.findUnique({
              where: { userId: user.id }
            })
          )?.roles ?? [],
        clientName
      }

    const interopToken = request.headers.get('interop-token')
    const ipAddress = request.headers.get('x-forwarded-for')
    const interopContext = getInteropContext({ interopToken, ipAddress })
    if (interopContext != null)
      return {
        ...initContextCache(),
        type: 'interop',
        ...interopContext,
        clientName
      }

    return {
      ...initContextCache(),
      type: 'public',
      clientName
    }
  },
  plugins: [
    tracingPlugin,
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
          session: (request) =>
            get(request, '_json.extensions.jwt.payload.user_id') ??
            request.headers.get('interop-token') ??
            null,
          enabled: (request) =>
            get(request, '_json.extensions.jwt.payload.user_id') == null &&
            request.headers.get('interop-token') == null,
          cache,
          ttlPerSchemaCoordinate: {
            'Query.getMyMuxVideo': 0,
            'Query.getMuxVideo': 0
          },
          ttlPerType: {
            User: 1000
          }
        })
      : {}
  ]
})
