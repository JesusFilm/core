import { initContextCache } from '@pothos/core'
import { createYoga, useReadinessCheck } from 'graphql-yoga'
import { App, HttpRequest, HttpResponse } from 'uWebSockets.js'

import { authZEnvelopPlugin } from '@graphql-authz/envelop-plugin'
import { getUserFromApiKey } from './lib/auth'
import { prisma } from './lib/prisma'
import { schema } from './schema'
import { rules } from './lib/rules'

interface ServerContext {
  req: HttpRequest
  res: HttpResponse
}

const yoga = createYoga<ServerContext>({
  schema,
  context: async ({ request }) => {
    const apiKey = request.headers
      .get('authorization')
      ?.replace(/^Bearer\s/, '')

    return {
      ...initContextCache(),
      currentUser: await getUserFromApiKey(apiKey)
    }
  },
  logging: 'error',
  plugins: [
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

App()
  .any(
    '/*',
    yoga as (res: HttpResponse, req: HttpRequest) => void | Promise<void>
  )
  .listen(4007, () => {
    console.info('Server is running on http://localhost:4003/graphql')
  })
