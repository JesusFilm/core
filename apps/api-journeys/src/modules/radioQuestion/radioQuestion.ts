import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { AuthenticationError } from 'apollo-server-errors'
import { transformBlock } from '../block'
import { transformResponse } from '../response'
import { RadioQuestionModule } from './__generated__/types'

const typeDefs = gql`
  input RadioQuestionResponseCreateInput {
    """
    ID should be unique Response UUID (Provided for optimistic mutation result matching)
    """
    id: ID
    blockId: ID!
    radioOptionBlockId: ID!
  }

  type RadioOptionBlock implements Block {
    id: ID!
    parentBlockId: ID
    label: String!
    action: Action
  }

  type RadioQuestionBlock implements Block {
    id: ID!
    parentBlockId: ID
    label: String!
    description: String
  }

  type RadioQuestionResponse implements Response {
    id: ID!
    userId: ID!
    radioOptionBlockId: ID!
    block: RadioQuestionBlock
  }

  extend type Mutation {
    radioQuestionResponseCreate(
      input: RadioQuestionResponseCreateInput!
    ): RadioQuestionResponse!
  }
`

const resolvers: RadioQuestionModule.Resolvers = {
  RadioQuestionResponse: {
    async block(response, __, { db }) {
      const block = await db.block.findUnique({
        where: { id: response.blockId }
      })
      if (block == null) return null
      return transformBlock(block)
    }
  },
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
    }
  }
}

export const radioQuestionModule = createModule({
  id: 'radioQuestion',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
