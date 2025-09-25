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

import { prisma } from '@core/prisma/journeys/client'
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

    if (user != null) {
      const currentRoles =
        (
          await prisma.userRole.findUnique({
            where: { userId: user?.id }
          })
        )?.roles ?? []

      return {
        ...initContextCache(),
        type: 'authenticated',
        user: { ...user, roles: currentRoles },
        currentRoles
      }
    }
    const interopToken = request.headers.get('interop-token')
    const ipAddress = request.headers.get('x-forwarded-for')
    const interopContext = getInteropContext({ interopToken, ipAddress })
    if (interopContext != null)
      return {
        ...initContextCache(),
        type: 'interop',
        ...interopContext
      }

    return {
      ...initContextCache(),
      type: 'public'
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
          session: () => null,
          cache
        })
      : {}
  ]
})
