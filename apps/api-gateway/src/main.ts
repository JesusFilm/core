import { ApolloServer } from 'apollo-server'
import { ApolloGateway } from '@apollo/gateway'

const gateway = new ApolloGateway()

const server = new ApolloServer({
  gateway
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
}).catch((err) => console.error(err))
