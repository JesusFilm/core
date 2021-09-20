import { ApolloServer } from 'apollo-server'
import application from './modules/application'
import db from './lib/db'

const schema = application.createSchemaForApollo()
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
    console.log(`🚀  Server ready at ${url}/graphql`)
  })
  .catch((err) => {
    console.error(err)
  })
