import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { UserSessionModule } from './__generated__/types'

const typeDefs = gql`
  extend type Mutation {
    userSessionCreate(journeyId: ID!): ID!
  }
`

const resolvers: UserSessionModule.Resolvers = {
  Mutation: {
    async userSessionCreate(_parent, { journeyId }, { db }) {
      const session = await db.userSession.create({
        data: {
          journeyId
        }
      })
      return session.id
    }
  }
}

export default createModule({
  id: 'userSession',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
