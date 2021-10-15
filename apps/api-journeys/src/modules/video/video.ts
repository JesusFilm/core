import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { AuthenticationError } from 'apollo-server-errors'
import { transformBlock } from '../block'
import { transformResponse } from '../response'
import { VideoModule } from './__generated__/types'

const typeDefs = gql`
  enum VideoResponseStateEnum {
    PLAYING
    PAUSED
    FINISHED
    SECONDSWATCHED
  }

  input VideoResponseCreateInput {
    """
    ID should be unique Response UUID (Provided for optimistic mutation result matching)
    """
    id: ID
    blockId: ID!
    state: VideoResponseStateEnum!
  }

  type VideoBlock implements Block {
    id: ID!
    parentBlockId: ID
    mediaComponentId: String
    languageId: String
    title: String!
    description: String
    volume: Int
    autoplay: Boolean
  }

  type VideoResponse implements Response {
    id: ID!
    userId: ID!
    state: VideoResponseStateEnum!
    block: VideoBlock
  }

  extend type Mutation {
    videoResponseCreate(input: VideoResponseCreateInput!): VideoResponse!
  }
`

const resolvers: VideoModule.Resolvers = {
  VideoResponse: {
    async block(response, __, { db }) {
      const block = await db.block.findUnique({
        where: { id: response.blockId }
      })
      if (block == null) return null
      return transformBlock(block)
    }
  },
  Mutation: {
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

export const videoModule = createModule({
  id: 'video',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
