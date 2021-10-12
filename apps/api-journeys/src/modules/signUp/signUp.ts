import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { AuthenticationError } from 'apollo-server-errors'
import { transformBlock } from '../block'
import { transformResponse } from '../response'
import { SignUpModule } from './__generated__/types'

const typeDefs = gql`
  input SignUpResponseCreateInput {
    """
    ID should be unique Response UUID (Provided for optimistic mutation result matching)
    """
    id: ID
    blockId: ID!
    name: String!
    email: String!
  }

  type SignUpBlock implements Block {
    id: ID!
    parentBlockId: ID
    action: Action
    submitIcon: Icon
    submitLabel: String
  }

  type SignUpResponse implements Response {
    id: ID!
    userId: ID!
    name: String!
    email: String!
    block: SignUpBlock
  }

  extend type Mutation {
    signUpResponseCreate(input: SignUpResponseCreateInput!): SignUpResponse!
  }
`

const resolvers: SignUpModule.Resolvers = {
  SignUpResponse: {
    async block(response, __, { db }) {
      const block = await db.block.findUnique({
        where: { id: response.blockId }
      })
      if (block == null) return null
      return transformBlock(block)
    }
  },
  Mutation: {
    async signUpResponseCreate(
      _parent,
      { input: { id, blockId, name, email } },
      { db, userId }
    ) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')
      const response = await db.response.create({
        data: {
          id: id as string | undefined,
          type: 'SignUpResponse',
          blockId,
          userId,
          extraAttrs: { name, email }
        }
      })
      return transformResponse(response)
    }
  }
}

export const signUpModule = createModule({
  id: 'signUp',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
