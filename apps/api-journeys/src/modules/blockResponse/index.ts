import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { BlockResponseModule } from './__generated__/types'

const typeDefs = gql`
  enum VideoBlockResponseStateEnum {
    PLAYING
    PAUSED
    FINISHED
  }

  input SignupBlockResponseInput {
    userSessionId: ID!
    blockId: ID!
    name: String!
    email: String!
  }

  input VideoBlockResponseInput {
    userSessionId: ID!
    blockId: ID!
    position: Float!
    state: VideoBlockResponseStateEnum!
  }

  input RadioQuestionBlockResponseInput {
    userSessionId: ID!
    blockId: ID!
    selectedResponseBlockId: ID!
  }
  extend type Mutation {
    signupBlockResponseCreate(input: SignupBlockResponseInput!): ID!
    videoBlockResponseCreate(input: VideoBlockResponseInput!): ID!
    radioQuestionBlockResponseCreate(input: RadioQuestionBlockResponseInput!): ID!
  }
`

const resolvers: BlockResponseModule.Resolvers = {
  Mutation: {
    async signupBlockResponseCreate (_parent, { input }, { db }) {
      const { userSessionId, blockId, name, email } = input
      const { id } = await db.blockResponse.create({
        data: {
          userSessionId,
          blockId,
          responseData: { name, email }
        }
      })
      return id
    },
    async videoBlockResponseCreate (_parent, { input }, { db }) {
      const { userSessionId, blockId, position, state } = input
      const { id } = await db.blockResponse.create({
        data: {
          userSessionId,
          blockId,
          responseData: { position, state }
        }
      })
      return id
    },
    async radioQuestionBlockResponseCreate (_parent, { input }, { db }) {
      const { userSessionId, blockId, selectedResponseBlockId } = input
      const { id } = await db.blockResponse.create({
        data: {
          userSessionId,
          blockId,
          responseData: { selectedResponseBlockId }
        }
      })
      return id
    }
  }
}

export default createModule({
  id: 'blockResponse',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
