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
    signupBlockResponseCreate(userSessionId: ID!, blockId: ID!, name: String!, email: String!): ID!
    videoBlockResponseCreate(userSessionId: ID!, blockId: ID!, position: Float!, state: VideoBlockResponseStateEnum!): ID!
    radioQuestionBlockResponseCreate(userSessionId: ID!, blockId: ID!, selectedResponseBlockId: ID!): ID!
  }
`

const resolvers: BlockResponseModule.Resolvers = {
  Mutation: {
    async signupBlockResponseCreate (_parent, { userSessionId, blockId, name, email }, { db }) {
      const response = await db.blockResponse.create({
        data: {
          userSessionId,
          blockId,
          responseData: { name, email }
        }
      })
      return response.id
    },
    async videoBlockResponseCreate (_parent, { userSessionId, blockId, position, state }, { db }) {
      const response = await db.blockResponse.create({
        data: {
          userSessionId,
          blockId,
          responseData: { position, state }
        }
      })
      return response.id
    },
    async radioQuestionBlockResponseCreate (_parent, { userSessionId, blockId, selectedResponseBlockId }, { db }) {
      const response = await db.blockResponse.create({
        data: {
          userSessionId,
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
