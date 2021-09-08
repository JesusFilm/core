import { ApolloServer } from 'apollo-server'
import { gateway } from './environments/environment'

const server = new ApolloServer({ gateway })

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
}).catch((err) => console.error(err))
