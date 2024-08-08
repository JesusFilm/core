import { createYoga, useReadinessCheck } from 'graphql-yoga'

import { prisma } from './lib/prisma'
import { schema } from './schema'

export const yoga = createYoga({
  schema,
  plugins: [
    useReadinessCheck({
      endpoint: '/.well-known/apollo/server-health',
      check: async () => {
        await prisma.$queryRaw`SELECT 1`
      }
    })
  ]
})
