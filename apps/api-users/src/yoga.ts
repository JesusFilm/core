import {
  useForwardedJWT,
  useHmacSignatureValidation
} from '@graphql-hive/gateway'
import { createYoga, useReadinessCheck } from 'graphql-yoga'
import get from 'lodash/get'

import { getUserFromRequest } from '@core/yoga/firebaseClient'

import { prisma } from './lib/prisma'
import { schema } from './schema'
import { Context } from './schema/builder'

export const yoga = createYoga({
  schema,
  context: async ({ request, params }) => {
    const payload = get(params, 'extensions.jwt.payload')
    const currentUser = await getUserFromRequest(request, payload)
    const interopToken = request.headers.get('interop-token')
    const ipAddress = request.headers.get('x-forwarded-for')

    return {
      currentUser,
      interopToken,
      ipAddress
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
    })
  ]
})
