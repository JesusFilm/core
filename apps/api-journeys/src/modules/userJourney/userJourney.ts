import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  type UserJourney {
    userId: ID!
    journeyId: ID!
    role: String
  }
`

export const userJourneyModule = createModule({
  id: 'userJourney',
  dirname: __dirname,
  typeDefs: [typeDefs]
})
