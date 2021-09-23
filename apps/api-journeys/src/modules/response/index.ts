import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { ResponseModule } from './__generated__/types'
import { AuthenticationError } from 'apollo-server-errors'
import { get } from 'lodash'
import { ResponseResolvers } from '../../__generated__/types'

const typeDefs = gql`
  input RadioQuestionResponseCreateInput {
    blockId: ID!
    radioOptionBlockId: ID!
  }

  input SignupResponseCreateInput {
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

  type SignupResponse implements Response {
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
    signupResponseCreate(input: SignupResponseCreateInput!): SignupResponse!
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
    async signupResponseCreate(
      _parent,
      { input: { blockId, name, email } },
      { db, userId }
    ) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')
      return await db.response.create({
        data: {
          type: 'SignupResponse',
          blockId,
          userId,
          extraAttrs: { name, email }
        },
        include: { block: true }
      })
    },
    async radioQuestionResponseCreate(
      _parent,
      { input: { blockId, radioOptionBlockId } },
      { db, userId }
    ) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')
      return await db.response.create({
        data: {
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
      { input: { blockId, state } },
      { db, userId }
    ) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')
      return await db.response.create({
        data: {
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
  SignupResponse: {
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
