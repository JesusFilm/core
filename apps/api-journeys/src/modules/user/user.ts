import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  type User {
    id: ID!
    firebaseId: ID
    firstName: String
    lastName: String
    email: String
    imageUrl: String
    UserJourney: [UserJourney!]
  }
`

export const userModule = createModule({
  id: 'user',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
