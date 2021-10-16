import { ApolloServer } from 'apollo-server'
import { ApolloServer as ApolloServerLambda } from 'apollo-server-lambda'
import { application } from './application'
import db from './lib/db'

const schema = application.createSchemaForApollo()

if (require.main === module) {
  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const userId = req.headers['user-id']
      return { db, userId }
    }
  })

  server
    .listen({ host: '0.0.0.0', port: 4001 })
    .then(({ url }) => {
      console.log(`🚀  Server ready at ${url}graphql`)
    })
    .catch((err) => {
      console.error(err)
    })
} else {
  const lambdaserver = new ApolloServerLambda({
    schema,
    context: {
      db
    }
  })
  exports.handler = lambdaserver.createHandler()
}
