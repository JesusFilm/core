import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway'
import { ApolloServer } from 'apollo-server'
import { initializeApp, credential, auth } from 'firebase-admin'
import { config } from './environments/environment'

if (
  process.env.GOOGLE_APPLICATION_JSON != null &&
  process.env.GOOGLE_APPLICATION_JSON !== ''
) {
  initializeApp({
    credential: credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_JSON))
  })
}

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

const server = new ApolloServer({
  gateway,
  plugins: [],
  csrfPrevention: true,
  cors: config.cors,
  context: async ({ req }) => {
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
})

server
  .listen(config.listenOptions)
  .then(({ url }) => {
    console.log(`🚀 Server ready at ${url}graphql`)
  })
  .catch((err) => console.error(err))
