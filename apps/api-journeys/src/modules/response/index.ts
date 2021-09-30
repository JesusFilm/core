import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { ResponseModule } from './__generated__/types'
import { AuthenticationError } from 'apollo-server-errors'
import { get } from 'lodash'
import { ResponseResolvers } from '../../__generated__/types'

const typeDefs = gql`
  input RadioQuestionResponseCreateInput {
    """
    ID should be unique Response UUID (Provided for optimistic mutation result matching)
    """
    id: ID
    blockId: ID!
    radioOptionBlockId: ID!
  }

  input SignUpResponseCreateInput {
    """
    ID should be unique Response UUID (Provided for optimistic mutation result matching)
    """
    id: ID
    blockId: ID!
    name: String!
    email: String!
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

  type SignUpResponse implements Response {
    id: ID!
    userId: ID!
    name: String!
    email: String!
  }

  type VideoResponse implements Response {
    id: ID!
    userId: ID!
    state: VideoResponseStateEnum!
  }

  extend type Mutation {
    signUpResponseCreate(input: SignUpResponseCreateInput!): SignUpResponse!
    radioQuestionResponseCreate(
      input: RadioQuestionResponseCreateInput!
    ): RadioQuestionResponse!
    videoResponseCreate(input: VideoResponseCreateInput!): VideoResponse!
  }
`

type Resolvers = ResponseModule.Resolvers & {
  Response: ResponseResolvers
}

const resolvers: Resolvers = {
  Mutation: {
    async signUpResponseCreate(
      _parent,
      { input: { id, blockId, name, email } },
      { db, userId }
    ) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')
      return await db.response.create({
        data: {
          id: id as string | undefined,
          type: 'SignUpResponse',
          blockId,
          userId,
          extraAttrs: { name, email }
        },
        include: { block: true }
      })
    },
    async radioQuestionResponseCreate(
      _parent,
      { input: { id, blockId, radioOptionBlockId } },
      { db, userId }
    ) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')
      return await db.response.create({
        data: {
          id: id as string | undefined,
          type: 'RadioQuestionResponse',
          blockId,
          userId,
          extraAttrs: { radioOptionBlockId }
        },
        include: { block: true }
      })
    },
    async videoResponseCreate(
      _parent,
      { input: { id, blockId, state } },
      { db, userId }
    ) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')
      return await db.response.create({
        data: {
          id: id as string | undefined,
          type: 'VideoResponse',
          blockId,
          userId,
          extraAttrs: { state }
        },
        include: { block: true }
      })
    }
  },
  Response: {
    __resolveType: ({ type }) => type
  },
  RadioQuestionResponse: {
    radioOptionBlockId: ({ extraAttrs }) =>
      get(extraAttrs, 'radioOptionBlockId')
  },
  SignUpResponse: {
    name: ({ extraAttrs }) => get(extraAttrs, 'name'),
    email: ({ extraAttrs }) => get(extraAttrs, 'email')
  },
  VideoResponse: {
    state: ({ extraAttrs }) => get(extraAttrs, 'state')
  }
}

export default createModule({
  id: 'response',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
