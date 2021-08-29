import { ApolloServer } from 'apollo-server-fastify'
import application from './modules/application'
import db from './lib/db'
import Fastify, { FastifyInstance, FastifyServerFactory } from 'fastify'

const init = async (serverFactory?: FastifyServerFactory): Promise<FastifyInstance> => {
  const app = Fastify({ serverFactory })
  const schema = application.createSchemaForApollo()

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

if (require.main !== module) {
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
  module.exports = init
}
