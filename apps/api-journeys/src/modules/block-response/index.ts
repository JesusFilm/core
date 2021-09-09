import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'

const typeDefs = gql`
  type JourneySession {
    journey: Journey!
    name: String
    email: String
    blockResponses: [BlockResponse!]!
  }

  interface BlockResponse {
    journeySession: JourneySession!
    block: Block!
  }

  type SignupBlockResponse implements BlockResponse {
    journeySession: JourneySession!
    block: Block!
    name: String
    email: String
  }

  type VideoBlockResponse implements BlockResponse {
    journeySession: JourneySession!
    block: Block!
    position: Float
    state: VideoBlockResponseStateEnum
  }

  enum VideoBlockResponseStateEnum {
    PLAYING
    PAUSED
    FINISHED
  }

  type RadioQuestionBlockResponse implements BlockResponse {
    journeySession: JourneySession!
    block: Block!
    selectedOption: RadioOptionBlock!
  }

  extend type Mutation {
    journeySessionCreate(journeyId: ID!): ID!

    # We could instead of returning the whole BlockResponse, just return the id since the clients don't really care
    # We could split this out into n mutations that would have strongly typed inputs
    blockResponseCreate(journeySessionId: ID!, blockId: ID!, responseMetadateJSON: String): BlockResponse!
  }
`

const resolvers = {
  Mutation: {
    async journeySessionCreate (_parent, { journeyId }, { db }) {
      return await db.journeySession.create({
        data: {
          journeyId
        }
      })
    },
    async blockResponseCreate (_parent, { journeySessionId, blockId, responseMetadateJSON }, { db }) {
      return await db.blockResponse.create({
        data: {
          journeySessionId, blockId, responseMetadateJSON
        }
      })
    }
  }
}

export default createModule({
  id: 'block-response',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
