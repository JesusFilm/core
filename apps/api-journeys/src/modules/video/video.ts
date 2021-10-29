import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { AuthenticationError } from 'apollo-server-errors'
import { transformBlock } from '../block'
import { transformResponse } from '../response'
import { VideoModule } from './__generated__/types'
import fetch from 'node-fetch'
import { VideoResolvers } from '../../__generated__/types'

const typeDefs = gql`
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
    position: Float
  }

  interface Video {
    src: String!
  }

  type VideoArclight implements Video {
    mediaComponentId: String!
    languageId: String!
    src: String!
  }

  type VideoGeneric implements Video {
    src: String!
  }

  type VideoBlock implements Block {
    id: ID!
    parentBlockId: ID
    title: String!
    startAt: Int
    description: String
    volume: Int
    autoplay: Boolean
    video: Video
  }

  type VideoResponse implements Response {
    id: ID!
    userId: ID!
    state: VideoResponseStateEnum!
    position: Float
    block: VideoBlock
  }

  extend type Mutation {
    videoResponseCreate(input: VideoResponseCreateInput!): VideoResponse!
  }
`

const resolvers: VideoModule.Resolvers & { Video: VideoResolvers } = {
  Video: {
    __resolveType(video) {
      if (
        (video as VideoModule.VideoArclight).mediaComponentId != null &&
        (video as VideoModule.VideoArclight).languageId != null
      ) {
        return 'VideoArclight'
      }
      return 'VideoGeneric'
    }
  },
  VideoArclight: {
    src: async ({ mediaComponentId, languageId }) => {
      const response = await fetch(
        `https://arc.gt/hls/${mediaComponentId}/${languageId}`
      )
      return response.url
    }
  },
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
      { input: { id, blockId, state, position } },
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
          extraAttrs: { state, position }
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
