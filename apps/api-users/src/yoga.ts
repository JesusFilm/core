import {
  useForwardedJWT,
  useHmacSignatureValidation
} from '@graphql-hive/gateway'
import { createYoga, useReadinessCheck } from 'graphql-yoga'
import get from 'lodash/get'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { prisma } from './lib/prisma'
import { schema } from './schema'
import { Context } from './schema/builder'

export const yoga = createYoga<Record<string, unknown>, Context>({
  schema,
  context: async ({ request, params }) => {
    const payload = get(params, 'extensions.jwt.payload')
    const currentUser = await getUserFromPayload(payload)
    const interopToken = request.headers.get('interop-token')
    const ipAddress = request.headers.get('x-forwarded-for')

    return {
      currentUser,
      interopToken,
      ipAddress
    }
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
