import { ApolloGateway } from '@apollo/gateway'
import { ApolloServer } from 'apollo-server'
import { config } from './environments/environment'

export const gateway = new ApolloGateway(config.gatewayConfig)
const server = new ApolloServer({ gateway })

server
  .listen(config.listenOptions)
  .then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
  })
  .catch((err) => console.error(err))
