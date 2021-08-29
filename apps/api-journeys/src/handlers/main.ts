import { ApolloServer } from 'apollo-server-fastify'
import { ApolloServer as ApolloServerLambda } from 'apollo-server-lambda'
import application from '../modules/application'
import db from '../lib/db'
import Fastify, { FastifyInstance, FastifyServerFactory } from 'fastify'
const schema = application.createSchemaForApollo()

const init = async (serverFactory?: FastifyServerFactory): Promise<FastifyInstance> => {
  const app = Fastify({ serverFactory })
  
  const server = new ApolloServer({
    schema,
    context: {
      db
    }
  })

  await server.start()
  await app.register(server.createHandler())
  return await app
}

if (require.main === module) {
  // called directly i.e. "node app"
  init().then(async (server) => {
    try {
      const result = await server.listen(3000)
      console.log(`🚀  Server ready at ${result}/graphql`)
    } catch (err) {
      console.error(err)
    }
  }).catch((err) => console.error(err))
} else {
  // required as a module => executed on aws lambda
  
  const lambdaserver = new ApolloServerLambda({
    schema,
    context: {
      db
    }
  })
  exports.handler = lambdaserver.createHandler();
}
