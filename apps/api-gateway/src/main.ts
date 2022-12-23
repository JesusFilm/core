import http from 'http'
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { initializeApp, credential, auth } from 'firebase-admin'
import express from 'express'
import { json } from 'body-parser'
import cors from 'cors'
import { apolloWinstonLoggingPlugin } from '@core/apollo/logging/apolloWinstonLoggingPlugin'
import { config } from './environments/environment'

if (
  process.env.GOOGLE_APPLICATION_JSON != null &&
  process.env.GOOGLE_APPLICATION_JSON !== ''
) {
  initializeApp({
    credential: credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_JSON))
  })
}

const app = express()
const httpServer = http.createServer(app)

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }): void {
    // Pass the user's id from the context to each subgraph
    // as a header called `user-id`
    if (context.userId != null) {
      request.http.headers.set('user-id', context.userId)
    }
    if (context.ipAddress != null) {
      request.http.headers.set('X-Forwarded-For', context.ipAddress)
    }
    if (context.userAgent != null) {
      request.http.headers.set('user-agent', context.userAgent)
    }
  }
}

export const gateway = new ApolloGateway({
  ...config.gatewayConfig,
  buildService({ url }) {
    return new AuthenticatedDataSource({ url })
  }
})

interface CoreContext {
  ipAddress?: string | string[]
  userAgent?: string
  userId?: string
}

const server = new ApolloServer<CoreContext>({
  gateway,
  plugins: [apolloWinstonLoggingPlugin({ level: process.env.LOGGING_LEVEL })],
  csrfPrevention: true
})

const apolloContext = async ({ req }): Promise<CoreContext> => {
  const context = {
    ipAddress: req.headers['X-Forwared-For'] ?? req.socket.remoteAddress,
    userAgent: req.headers['user-agent']
  }

  const token = req.headers.authorization
  if (
    process.env.GOOGLE_APPLICATION_JSON == null ||
    process.env.GOOGLE_APPLICATION_JSON === '' ||
    token == null ||
    token === ''
  )
    return { ...context }
  try {
    const { uid } = await auth().verifyIdToken(token)
    return { ...context, userId: uid }
  } catch (err) {
    console.log(err)
    return { ...context }
  }
}

server
  .start()
  .then(() => {
    app.use(
      '/graphql',
      cors<cors.CorsRequest>(config.cors),
      json(),
      expressMiddleware<CoreContext>(server, {
        context: apolloContext
      })
    )
    httpServer.listen(config.listenOptions, () =>
      console.log(
        `🚀 Server ready at ${
          httpServer.address()?.toString() ?? 'http:localhost:4000/'
        }graphql`
      )
    )
  })
  .catch((err) => console.error(err))
