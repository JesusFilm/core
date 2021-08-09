import { ApolloServer } from 'apollo-server'
import application from './modules/application'
import { PrismaClient } from '.prisma/api-journeys-client'

const schema = application.createSchemaForApollo()

const server = new ApolloServer({
  schema,
  context: {
    db: new PrismaClient()
  }
})

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
}, () => {
  throw new Error('failed to start ApolloServer')
})
