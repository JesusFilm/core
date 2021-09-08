import { ApolloGateway } from '@apollo/gateway'

export const gateway = new ApolloGateway({
  serviceList: [
    { name: 'journeys', url: 'http://localhost:4001/graphql' }
  ]
})
