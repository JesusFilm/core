import { createYoga, useReadinessCheck } from 'graphql-yoga'
import { App, HttpRequest, HttpResponse } from 'uWebSockets.js'

import { db } from './db'
import { schema } from './schema'

interface ServerContext {
  req: HttpRequest
  res: HttpResponse
}
// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga<ServerContext>({
  schema,
  plugins: [
    useReadinessCheck({
      endpoint: '/.well-known/apollo/server-health',
      check: async () => {
        // if resolves, respond with 200 OK
        // if throw, respond with 503 Service Unavailable and error message as plaintext in body
        await db.$queryRaw`SELECT 1`
      }
    })
  ]
})

// Pass it into a server to hook into request handlers.
App()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  .any('/*', yoga)
  .listen(4003, (token) => {
    console.info('Server is running on http://localhost:4003/graphql')
  })
