import { createServer } from 'node:http'

import { createYoga, useReadinessCheck } from 'graphql-yoga'

import { db } from './db'
import { schema } from './schema'

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({
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
// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = createServer(yoga)

// Start the server and you're done!
server.listen(4003, () => {
  console.info('Server is running on http://localhost:4003/graphql')
})
