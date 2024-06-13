import { createYoga, useReadinessCheck } from 'graphql-yoga'
import { App, HttpRequest, HttpResponse } from 'uWebSockets.js'

import { prisma } from './lib/prisma'
import { schema } from './schema'

interface ServerContext {
  req: HttpRequest
  res: HttpResponse
}

const yoga = createYoga<ServerContext>({
  schema,
  logging: 'error',
  plugins: [
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
