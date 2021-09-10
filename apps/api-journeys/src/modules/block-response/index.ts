import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { BlockResponseModule } from './__generated__/types'

const typeDefs = gql`
  enum VideoBlockResponseStateEnum {
    PLAYING
    PAUSED
    FINISHED
  }

  extend type Mutation {
    journeySessionCreate(journeyId: ID!): ID!

    signupBlockResponseCreate(journeySessionId: ID!, blockId: ID!, name: String!, email: String!): ID!
    videoBlockResponseCreate(journeySessionId: ID!, blockId: ID!, position: Float!, state: VideoBlockResponseStateEnum!): ID!
    radioQuestionBlockResponseCreate(journeySessionId: ID!, blockId: ID!, selectedResponseBlockId: ID!): ID!
  }
`

const resolvers: BlockResponseModule.Resolvers = {
  Mutation: {
    async journeySessionCreate (_parent, { journeyId }, { db }) {
      const session = await db.journeySession.create({
        data: {
          journeyId
        }
      })
      return session.id
    },
    async signupBlockResponseCreate (_parent, { journeySessionId, blockId, name, email }, { db }) {
      const response = await db.blockResponse.create({
        data: {
          journeySessionId,
          blockId,
          responseData: { name, email }
        }
      })
      return response.id
    },
    async videoBlockResponseCreate (_parent, { journeySessionId, blockId, position, state }, { db }) {
      const response = await db.blockResponse.create({
        data: {
          journeySessionId,
          blockId,
          responseData: { position, state }
        }
      })
      return response.id
    },
    async radioQuestionBlockResponseCreate (_parent, { journeySessionId, blockId, selectedResponseBlockId }, { db }) {
      const response = await db.blockResponse.create({
        data: {
          journeySessionId,
          blockId,
          responseData: { selectedResponseBlockId }
        }
      })
      return response.id
    }
  }
}

export default createModule({
  id: 'block-response',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
