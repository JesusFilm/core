import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { ResponseModule } from './__generated__/types'
import { AuthenticationError } from 'apollo-server-errors'
import { transformResponse } from '.'

const typeDefs = gql`
  input RadioQuestionResponseCreateInput {
    """
    ID should be unique Response UUID (Provided for optimistic mutation result matching)
    """
    id: ID
    blockId: ID!
    radioOptionBlockId: ID!
  }

  enum VideoResponseStateEnum {
    PLAYING
    PAUSED
    FINISHED
  }

  input VideoResponseCreateInput {
    """
    ID should be unique Response UUID (Provided for optimistic mutation result matching)
    """
    id: ID
    blockId: ID!
    state: VideoResponseStateEnum!
  }

  interface Response {
    id: ID!
    userId: ID!
  }

  type RadioQuestionResponse implements Response {
    id: ID!
    userId: ID!
    radioOptionBlockId: ID!
  }

  type VideoResponse implements Response {
    id: ID!
    userId: ID!
    state: VideoResponseStateEnum!
  }

  extend type Mutation {
    radioQuestionResponseCreate(
      input: RadioQuestionResponseCreateInput!
    ): RadioQuestionResponse!
    videoResponseCreate(input: VideoResponseCreateInput!): VideoResponse!
  }
`

const resolvers: ResponseModule.Resolvers = {
  Mutation: {
    async radioQuestionResponseCreate(
      _parent,
      { input: { id, blockId, radioOptionBlockId } },
      { db, userId }
    ) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')
      const response = await db.response.create({
        data: {
          id: id as string | undefined,
          type: 'RadioQuestionResponse',
          blockId,
          userId,
          extraAttrs: { radioOptionBlockId }
        }
      })
      return transformResponse(response)
    },
    async videoResponseCreate(
      _parent,
      { input: { id, blockId, state } },
      { db, userId }
    ) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')
      const response = await db.response.create({
        data: {
          id: id as string | undefined,
          type: 'VideoResponse',
          blockId,
          userId,
          extraAttrs: { state }
        }
      })
      return transformResponse(response)
    }
  }
}

export const responseModule = createModule({
  id: 'response',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
