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
  context: async ({ req }) => {
    const token = req.headers.authorization
    if (
      process.env.GOOGLE_APPLICATION_JSON == null ||
      process.env.GOOGLE_APPLICATION_JSON === '' ||
      token == null
    )
      return {}
    try {
      const { uid } = await auth().verifyIdToken(token)
      return { userId: uid }
    } catch (err) {
      console.log(err)
      return {}
    }
  }
})

server
  .listen(config.listenOptions)
  .then(({ url }) => {
    console.log(`🚀 Server ready at ${url}graphql`)
  })
  .catch((err) => console.error(err))
